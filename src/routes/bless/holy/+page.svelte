<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import BlessingText from '$lib/components/BlessingText.svelte';
	import { audioManager } from '$lib/utils/audio';

	let muted = $state(false);

	const item = $derived(
		$page.url.searchParams.get('for') || ''
	);

	let canvas: HTMLCanvasElement;
	let showText = $state(false);
	let showReplay = $state(false);
	let animCleanup: (() => void) | null = null;

	function startAnimation() {
		showText = false;
		showReplay = false;
		animCleanup?.();
		audioManager.play('water');
		animCleanup = runDrops(canvas, () => {
			showText = true;
			showReplay = true;
		});
	}

	onMount(() => {
		startAnimation();
		return () => {
			animCleanup?.();
			audioManager.stop('water');
		};
	});

	function replay() {
		startAnimation();
	}

	function toggleMute() {
		muted = !muted;
		audioManager.setMute(muted);
	}

	// --- All drop logic lives here, no wrapper components ---

	interface FlyingDrop {
		originX: number;
		originY: number;
		targetX: number;
		targetY: number;
		progress: number;
		speed: number;
		size: number;
	}

	interface GlassDrop {
		x: number;
		y: number;
		radius: number;
		velocity: number;
		stuck: boolean;
		stuckTimer: number;
		stuckThreshold: number;
		trail: { x: number; y: number; r: number; alpha: number }[];
		alpha: number;
		// organic shape seed — random bumps per drop
		bumps: number[];
		bumpCount: number;
	}

	interface Splash {
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number;
		alpha: number;
		angle: number; // direction of movement for elongation
	}

	function runDrops(cvs: HTMLCanvasElement, onComplete: () => void): () => void {
		const ctx = cvs.getContext('2d')!;
		let width = (cvs.width = cvs.offsetWidth);
		let height = (cvs.height = cvs.offsetHeight);

		const flyingDrops: FlyingDrop[] = [];
		const glassDrops: GlassDrop[] = [];
		const splashes: Splash[] = [];

		let animId = 0;
		let elapsed = 0;
		let spawnTimer = 0;
		let totalSpawned = 0;
		const maxDrops = 40;
		let doneSpawning = false;
		let completeFired = false;

		// --- Broom state ---
		// Swing phases: 'idle' → 'swing' → 'hold' → 'fade'
		let broomSwing = 0;         // 0 = upright, 1 = fully swung toward camera
		let broomAlpha = 1;
		let broomPhase: 'idle' | 'swing' | 'hold' | 'fade' = 'idle';
		let broomTimer = 0;
		const SWING_DELAY = 8;      // frames before swing starts
		const SWING_DURATION = 10;  // frames for the swing
		const HOLD_DURATION = 15;   // frames holding after swing
		let dropsStarted = false;

		const resize = () => {
			width = cvs.width = cvs.offsetWidth;
			height = cvs.height = cvs.offsetHeight;
		};
		window.addEventListener('resize', resize);

		// Pre-generate random seeds so broom looks consistent across frames
		const strandSeeds: number[] = [];
		for (let i = 0; i < 200; i++) strandSeeds.push(Math.random());
		let seedIdx = 0;
		function seeded() { return strandSeeds[seedIdx++ % strandSeeds.length]; }

		/** Draw sorghum broom — handle is bundled straw (tapers up), flat fan bristles at top */
		function drawBroom() {
			const cx = width * 0.5;
			const cy = height * 0.5;

			const swing = broomSwing;
			const perspScale = 1 + swing * 0.8;
			const foreshorten = 1 - swing * 0.55;
			const bristleSpread = 1 + swing * 1.5;

			ctx.save();
			ctx.globalAlpha = broomAlpha;
			ctx.translate(cx, cy);
			ctx.scale(perspScale, perspScale * foreshorten);

			seedIdx = 0; // reset seed each frame for consistency

			// Coordinate system: 0,0 = center. Handle goes DOWN, bristles go UP.
			// Handle bottom (tip) at y=200, handle top / bristle start at y=-20

			// --- Handle (bundled sorghum straw, tapers from ~22px at base to ~10px at tip) ---
			const hTop = -20;
			const hBot = 200;
			const hLen = hBot - hTop;

			// Draw individual straw strands that make up the handle
			const handleStrands = 30;
			for (let i = 0; i < handleStrands; i++) {
				const t = i / (handleStrands - 1); // 0→1 across handle width
				const topW = 22;  // width at bristle junction
				const botW = 9;   // width at tip (tapers)

				const xTop = (t - 0.5) * topW;
				const xBot = (t - 0.5) * botW;

				const hue = 35 + seeded() * 12;
				const light = 58 + seeded() * 18;
				ctx.strokeStyle = `hsl(${hue}, 50%, ${light}%)`;
				ctx.lineWidth = 1.0 + seeded() * 0.6;

				ctx.beginPath();
				ctx.moveTo(xTop, hTop);
				ctx.lineTo(xBot, hBot);
				ctx.stroke();
			}

			// Handle body fill (semi-transparent to unify strands)
			const hGrad = ctx.createLinearGradient(0, hTop, 0, hBot);
			hGrad.addColorStop(0, 'rgba(195, 170, 120, 0.5)');
			hGrad.addColorStop(0.5, 'rgba(210, 185, 135, 0.4)');
			hGrad.addColorStop(1, 'rgba(185, 160, 110, 0.5)');

			ctx.beginPath();
			ctx.moveTo(-11, hTop);
			ctx.lineTo(-4.5, hBot);
			ctx.lineTo(4.5, hBot);
			ctx.lineTo(11, hTop);
			ctx.closePath();
			ctx.fillStyle = hGrad;
			ctx.fill();

			// --- String wraps on handle (spiral/rings) ---
			const wrapPositions = [0.08, 0.2, 0.35, 0.52, 0.7, 0.85];
			const wrapColors = ['#2d8a4e', '#2d8a4e', '#c44', '#2d8a4e', '#c44', '#2d8a4e'];
			for (let i = 0; i < wrapPositions.length; i++) {
				const wy = hTop + hLen * wrapPositions[i];
				const wLerp = wrapPositions[i];
				const halfW = 4.5 + (1 - wLerp) * 6.5; // wider near top

				ctx.strokeStyle = wrapColors[i];
				ctx.lineWidth = 2;
				ctx.globalAlpha = broomAlpha * 0.8;
				ctx.beginPath();
				ctx.moveTo(-halfW, wy);
				ctx.lineTo(halfW, wy);
				ctx.stroke();
				// Second line for thickness
				ctx.beginPath();
				ctx.moveTo(-halfW, wy + 1.5);
				ctx.lineTo(halfW, wy + 1.5);
				ctx.stroke();
				ctx.globalAlpha = broomAlpha;
			}

			// --- Bristle section (flat sorghum fan, fans out from handle top) ---
			const bristleBaseY = hTop;
			const bristleLen = 130;
			const bristleW = 75 * bristleSpread;
			const bristleCount = 60;

			// Two colored string wraps across the bristle fan
			// (draw bristles first, then wraps on top)

			for (let i = 0; i < bristleCount; i++) {
				const t = i / (bristleCount - 1); // 0→1
				// Bristles emerge from a narrow point and fan out
				const startX = (t - 0.5) * 18; // narrow at base (handle width)
				const endX = (t - 0.5) * bristleW; // wide at tips

				const len = bristleLen * (0.85 + seeded() * 0.2);
				const tipX = endX + (seeded() - 0.5) * 6;
				const tipY = bristleBaseY - len;

				// Slight natural curve outward
				const cpX = startX + (endX - startX) * 0.6 + (seeded() - 0.5) * 4;
				const cpY = bristleBaseY - len * 0.55;

				const hue = 36 + seeded() * 14;
				const sat = 42 + seeded() * 20;
				const light = 55 + seeded() * 22;
				ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
				ctx.lineWidth = 0.8 + seeded() * 0.7;

				ctx.beginPath();
				ctx.moveTo(startX, bristleBaseY);
				ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
				ctx.stroke();
			}

			// Thicker accent strands
			for (let i = 0; i < 15; i++) {
				const t = 0.05 + seeded() * 0.9;
				const startX = (t - 0.5) * 18;
				const endX = (t - 0.5) * bristleW;
				const len = bristleLen * (0.88 + seeded() * 0.14);
				const cpX = startX + (endX - startX) * 0.55 + (seeded() - 0.5) * 5;

				ctx.strokeStyle = `hsl(${33 + seeded() * 10}, ${45 + seeded() * 15}%, ${50 + seeded() * 15}%)`;
				ctx.lineWidth = 1.5 + seeded() * 0.8;

				ctx.beginPath();
				ctx.moveTo(startX, bristleBaseY);
				ctx.quadraticCurveTo(cpX, bristleBaseY - len * 0.55, endX + (seeded() - 0.5) * 5, bristleBaseY - len);
				ctx.stroke();
			}

			// --- Colored string wraps across the bristle fan ---
			const fanWraps = [
				{ pos: 0.15, color: '#2d8a4e' },  // green
				{ pos: 0.35, color: '#c44' },      // red
				{ pos: 0.55, color: '#2d8a4e' },   // green
			];
			for (const w of fanWraps) {
				const wy = bristleBaseY - bristleLen * w.pos;
				// Width at this Y — interpolate between handle width and full fan width
				const fanW = 18 + (bristleW - 18) * w.pos;

				ctx.strokeStyle = w.color;
				ctx.lineWidth = 1.8;
				ctx.globalAlpha = broomAlpha * 0.7;

				// Slight arc to follow the fan curvature
				ctx.beginPath();
				ctx.moveTo(-fanW / 2, wy + 2);
				ctx.quadraticCurveTo(0, wy - 3, fanW / 2, wy + 2);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(-fanW / 2, wy + 4);
				ctx.quadraticCurveTo(0, wy - 1, fanW / 2, wy + 4);
				ctx.stroke();

				ctx.globalAlpha = broomAlpha;
			}

			ctx.restore();
		}

		function spawnFlying() {
			// Drops originate from near the broom bristle area (center of screen)
			const cx = width * 0.5 + (Math.random() - 0.5) * width * 0.12;
			const cy = height * 0.38 + (Math.random() - 0.5) * height * 0.08;
			const tx = width * 0.1 + Math.random() * width * 0.8;
			const ty = height * 0.05 + Math.random() * height * 0.85;

			flyingDrops.push({
				originX: cx,
				originY: cy,
				targetX: tx,
				targetY: ty,
				progress: 0,
				speed: 0.02 + Math.random() * 0.025,
				size: 4 + Math.random() * 8
			});
		}

		function impact(x: number, y: number, size: number) {
			// Generate random bumps for organic blob shape
			const bumpCount = 6 + Math.floor(Math.random() * 4);
			const bumps: number[] = [];
			for (let i = 0; i < bumpCount; i++) {
				bumps.push(0.85 + Math.random() * 0.3); // radius multiplier per segment
			}

			glassDrops.push({
				x,
				y,
				radius: size * (1.5 + Math.random()),
				velocity: 0,
				stuck: true,
				stuckTimer: 0,
				stuckThreshold: 80 + Math.random() * 100,
				trail: [],
				alpha: 0.8 + Math.random() * 0.2,
				bumps,
				bumpCount
			});

			const count = 6 + Math.floor(Math.random() * 6);
			for (let i = 0; i < count; i++) {
				const angle = Math.random() * Math.PI * 2;
				const spd = 1.5 + Math.random() * 4;
				splashes.push({
					x,
					y,
					vx: Math.cos(angle) * spd,
					vy: Math.sin(angle) * spd,
					radius: 1.5 + Math.random() * 2.5,
					alpha: 0.9,
					angle
				});
			}
		}

		/** Build an organic blob path using smooth bezier curves through bumpy control points */
		function blobPath(cx: number, cy: number, r: number, bumps: number[], stretch = 1.0, stretchAngle = Math.PI / 2) {
			const n = bumps.length;
			// Generate points on the perimeter with bump offsets
			const pts: { x: number; y: number }[] = [];
			for (let i = 0; i < n; i++) {
				const a = (Math.PI * 2 * i) / n;
				const br = r * bumps[i];
				// Apply directional stretch (for dripping elongation)
				const sx = 1 + (stretch - 1) * Math.abs(Math.sin(a - stretchAngle));
				const sy = 1 + (stretch - 1) * Math.abs(Math.cos(a - stretchAngle));
				pts.push({
					x: cx + Math.cos(a) * br * sx,
					y: cy + Math.sin(a) * br * sy
				});
			}

			// Draw smooth closed curve through points using bezier
			ctx.beginPath();
			for (let i = 0; i < n; i++) {
				const curr = pts[i];
				const next = pts[(i + 1) % n];
				const prev = pts[(i - 1 + n) % n];
				const next2 = pts[(i + 2) % n];

				// Catmull-Rom → cubic bezier control points
				const cp1x = curr.x + (next.x - prev.x) / 6;
				const cp1y = curr.y + (next.y - prev.y) / 6;
				const cp2x = next.x - (next2.x - curr.x) / 6;
				const cp2y = next.y - (next2.y - curr.y) / 6;

				if (i === 0) ctx.moveTo(curr.x, curr.y);
				ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
			}
			ctx.closePath();
		}

		function drawGlassDrop(d: GlassDrop) {
			// Trail — small organic blobs
			for (const t of d.trail) {
				ctx.beginPath();
				ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(160, 200, 240, ${t.alpha * 0.3})`;
				ctx.fill();
			}

			const r = d.radius;

			// Stretch factor when dripping
			const stretch = d.stuck ? 1.0 : 1.0 + Math.min(d.velocity * 0.15, 0.6);

			// Organic blob body
			const grad = ctx.createRadialGradient(
				d.x - r * 0.25, d.y - r * 0.3, r * 0.05,
				d.x, d.y, r * 1.1
			);
			grad.addColorStop(0, `rgba(220, 240, 255, ${d.alpha * 0.95})`);
			grad.addColorStop(0.2, `rgba(195, 225, 252, ${d.alpha * 0.75})`);
			grad.addColorStop(0.5, `rgba(155, 200, 240, ${d.alpha * 0.45})`);
			grad.addColorStop(1, `rgba(110, 165, 220, ${d.alpha * 0.08})`);

			blobPath(d.x, d.y, r, d.bumps, stretch);
			ctx.fillStyle = grad;
			ctx.fill();

			// Subtle edge
			blobPath(d.x, d.y, r * 0.97, d.bumps, stretch);
			ctx.strokeStyle = `rgba(200, 225, 255, ${d.alpha * 0.2})`;
			ctx.lineWidth = 0.6;
			ctx.stroke();

			// Highlight — offset, slightly organic
			ctx.beginPath();
			ctx.ellipse(
				d.x - r * 0.2,
				d.y - r * 0.25,
				r * 0.18,
				r * 0.12,
				-0.3, 0, Math.PI * 2
			);
			ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.75})`;
			ctx.fill();

			// Secondary smaller highlight
			ctx.beginPath();
			ctx.ellipse(
				d.x - r * 0.05,
				d.y - r * 0.35,
				r * 0.07,
				r * 0.05,
				0.2, 0, Math.PI * 2
			);
			ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.4})`;
			ctx.fill();
		}

		/** Draw a teardrop shape for flying drops — pointed tail, round head */
		function drawTeardrop(cx: number, cy: number, r: number, angle: number, alpha: number) {
			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate(angle);

			// Teardrop: round front + tapered tail
			const tailLen = r * 2.2;
			ctx.beginPath();
			ctx.moveTo(-tailLen, 0);
			// Bezier curves forming teardrop shape
			ctx.bezierCurveTo(-tailLen * 0.4, -r * 0.5, -r * 0.2, -r * 0.95, 0, -r);
			ctx.bezierCurveTo(r * 0.55, -r * 0.95, r, -r * 0.55, r, 0);
			ctx.bezierCurveTo(r, r * 0.55, r * 0.55, r * 0.95, 0, r);
			ctx.bezierCurveTo(-r * 0.2, r * 0.95, -tailLen * 0.4, r * 0.5, -tailLen, 0);
			ctx.closePath();

			const g = ctx.createRadialGradient(-r * 0.1, -r * 0.15, 0, 0, 0, r * 1.2);
			g.addColorStop(0, `rgba(230, 245, 255, ${alpha})`);
			g.addColorStop(0.4, `rgba(175, 215, 252, ${alpha * 0.75})`);
			g.addColorStop(1, `rgba(120, 170, 230, ${alpha * 0.15})`);
			ctx.fillStyle = g;
			ctx.fill();

			// Tiny highlight
			ctx.beginPath();
			ctx.ellipse(r * 0.15, -r * 0.25, r * 0.2, r * 0.13, -0.2, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
			ctx.fill();

			ctx.restore();
		}

		let lastTime = performance.now();

		function animate(now: number) {
			const dt = Math.min((now - lastTime) / 16.67, 3);
			lastTime = now;
			elapsed += dt;
			ctx.clearRect(0, 0, width, height);

			// --- Broom animation (behind everything) ---
			broomTimer += dt;

			if (broomPhase === 'idle' && broomTimer > SWING_DELAY) {
				broomPhase = 'swing';
				broomTimer = 0;
			} else if (broomPhase === 'swing') {
				broomSwing = Math.min(broomTimer / SWING_DURATION, 1);
				// Ease-out for snappy swing
				broomSwing = 1 - (1 - broomSwing) * (1 - broomSwing);
				if (broomTimer >= SWING_DURATION) {
					broomSwing = 1;
					broomPhase = 'hold';
					broomTimer = 0;
					dropsStarted = true; // drops fly on impact
				}
			} else if (broomPhase === 'hold') {
				broomSwing = 1;
				if (broomTimer > HOLD_DURATION) {
					broomPhase = 'fade';
					broomTimer = 0;
				}
			} else if (broomPhase === 'fade') {
				broomAlpha = Math.max(0, 1 - broomTimer / 20);
			}

			if (broomAlpha > 0) {
				drawBroom();
			}

			// --- Spawn in bursts (only after swing) ---
			if (dropsStarted && !doneSpawning) {
				spawnTimer += dt;
				const rate = elapsed < 15 ? 1.5 : elapsed < 40 ? 2.5 : 3.5;
				if (spawnTimer > rate && totalSpawned < maxDrops) {
					spawnTimer = 0;
					const burst = 3 + Math.floor(Math.random() * 3);
					for (let i = 0; i < burst && totalSpawned < maxDrops; i++) {
						spawnFlying();
						totalSpawned++;
					}
				}
				if (totalSpawned >= maxDrops) doneSpawning = true;
			}

			// --- Flying drops (teardrop shape, oriented along movement direction) ---
			for (let i = flyingDrops.length - 1; i >= 0; i--) {
				const d = flyingDrops[i];
				d.progress += d.speed * dt;

				if (d.progress >= 1) {
					impact(d.targetX, d.targetY, d.size);
					flyingDrops.splice(i, 1);
					continue;
				}

				const t = d.progress * d.progress * d.progress; // cubic ease-in
				const x = d.originX + (d.targetX - d.originX) * t;
				const y = d.originY + (d.targetY - d.originY) * t;
				const scale = 0.08 + t * 0.92;
				const r = d.size * scale;
				const alpha = 0.25 + t * 0.7;

				// Movement direction angle for teardrop orientation
				const dx = d.targetX - d.originX;
				const dy = d.targetY - d.originY;
				const moveAngle = Math.atan2(dy, dx);

				// Soft glow
				ctx.beginPath();
				ctx.arc(x, y, r * 2, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(150, 200, 255, ${alpha * 0.12})`;
				ctx.fill();

				// Teardrop — tail points backward
				drawTeardrop(x, y, r, moveAngle, alpha);
			}

			// --- Splashes (elongated along their movement) ---
			for (let i = splashes.length - 1; i >= 0; i--) {
				const s = splashes[i];
				s.x += s.vx * dt;
				s.y += s.vy * dt;
				s.vy += 0.1 * dt;
				s.alpha -= 0.03 * dt;

				if (s.alpha <= 0) { splashes.splice(i, 1); continue; }

				// Elongated ellipse along movement direction
				const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
				const elongation = 1 + spd * 0.3;
				const angle = Math.atan2(s.vy, s.vx);

				ctx.save();
				ctx.translate(s.x, s.y);
				ctx.rotate(angle);
				ctx.beginPath();
				ctx.ellipse(0, 0, s.radius * elongation, s.radius * 0.6, 0, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(190, 225, 255, ${s.alpha})`;
				ctx.fill();
				ctx.restore();
			}

			// --- Glass drops ---
			for (let i = glassDrops.length - 1; i >= 0; i--) {
				const d = glassDrops[i];

				if (d.stuck) {
					d.stuckTimer += dt;
					if (d.stuckTimer > d.stuckThreshold) d.stuck = false;
				} else {
					d.velocity += 0.04 * dt;
					d.velocity = Math.min(d.velocity, 3.5);
					d.y += d.velocity * dt;
					d.x += Math.sin(d.y * 0.04 + i) * 0.12 * dt;

					if (Math.random() < 0.35) {
						d.trail.push({
							x: d.x + (Math.random() - 0.5) * d.radius * 0.4,
							y: d.y,
							r: d.radius * (0.15 + Math.random() * 0.25),
							alpha: d.alpha * 0.5
						});
					}
					d.radius *= 1 - 0.0008 * dt;
					d.alpha -= 0.0015 * dt;
				}

				for (let j = d.trail.length - 1; j >= 0; j--) {
					d.trail[j].alpha -= 0.004 * dt;
					if (d.trail[j].alpha <= 0) d.trail.splice(j, 1);
				}

				if (d.y > height + 30 || d.alpha <= 0.03) { glassDrops.splice(i, 1); continue; }

				drawGlassDrop(d);
			}

			// --- Completion ---
			if (doneSpawning && flyingDrops.length === 0 && splashes.length === 0 && !completeFired) {
				completeFired = true;
				setTimeout(onComplete, 2500);
			}

			animId = requestAnimationFrame(animate);
		}

		animId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
		};
	}
</script>

<div class="relative flex flex-1 flex-col" style="min-height: 100vh;">
	<!-- Top bar -->
	<div class="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4">
		<a
			href="{base}/bless"
			class="font-body text-(--gold)/70 hover:text-(--gold) transition-colors text-lg no-underline"
		>
			&#8592; Назад
		</a>
		<button
			onclick={toggleMute}
			class="text-(--gold)/70 hover:text-(--gold) transition-colors text-xl bg-transparent border-none cursor-pointer"
		>
			{muted ? '🔇' : '🔊'}
		</button>
	</div>

	<!-- Fullscreen canvas — no wrappers -->
	<canvas
		bind:this={canvas}
		class="absolute inset-0 z-20"
		style="width: 100%; height: 100%;"
	></canvas>

	<!-- Blessing text overlay -->
	{#if showText}
		<div class="absolute inset-0 z-30 flex items-center justify-center">
			<BlessingText visible={showText} {item} />
		</div>
	{/if}

	<!-- Replay button + nudge -->
	{#if showReplay}
		<div class="absolute bottom-8 left-0 right-0 z-40 flex flex-col items-center gap-4">
			<button
				onclick={replay}
				class="font-display cursor-pointer border border-(--gold)/50 bg-transparent px-6 py-3 text-lg tracking-wider text-(--gold-light) transition-all duration-300 hover:border-(--gold) hover:bg-(--gold)/10 hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]"
			>
				Ще раз
			</button>
			<div class="text-center animate-[fadeIn_2s_ease-in-out]">
				<p class="font-body text-base text-(--gold)/60">
					Святая вода v2.0 — тепер з донатом 💧
				</p>
				<div class="mt-1 flex flex-col items-center gap-1">
					<a href="{base}/bless#donate" class="font-body text-sm text-(--gold)/50 hover:text-(--gold)/80 transition-colors no-underline">
						Підтримати храм
					</a>
					<a href="{base}/saints" class="font-body text-sm text-(--gold)/50 hover:text-(--gold)/80 transition-colors no-underline">
						Потрап до Книги Святих →
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
