<script lang="ts">
	import { onMount } from 'svelte';

	let { onComplete = () => {} }: { onComplete?: () => void } = $props();

	let canvas: HTMLCanvasElement;

	// --- Types ---

	/** Drop flying toward the viewer (scales up from center) */
	interface FlyingDrop {
		originX: number;
		originY: number;
		targetX: number;
		targetY: number;
		progress: number; // 0→1
		speed: number;
		size: number;
	}

	/** Drop that "hit" the glass and is stuck / dripping */
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
	}

	/** Tiny splash particle on impact */
	interface Splash {
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number;
		alpha: number;
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);

		const flyingDrops: FlyingDrop[] = [];
		const glassDrops: GlassDrop[] = [];
		const splashes: Splash[] = [];

		let animId: number;
		let elapsed = 0;
		let spawnTimer = 0;
		let totalSpawned = 0;
		const maxDrops = 35;
		let doneSpawning = false;
		let completeFired = false;

		const resize = () => {
			width = canvas.width = window.innerWidth;
			height = canvas.height = window.innerHeight;
		};
		window.addEventListener('resize', resize);

		/** Spawn a drop that flies toward the viewer */
		function spawnFlying() {
			// Origin: center of screen (where the "throw" comes from)
			const cx = width * 0.5 + (Math.random() - 0.5) * width * 0.15;
			const cy = height * 0.5 + (Math.random() - 0.5) * height * 0.15;

			// Target: random position on screen
			const tx = Math.random() * width;
			const ty = Math.random() * height;

			flyingDrops.push({
				originX: cx,
				originY: cy,
				targetX: tx,
				targetY: ty,
				progress: 0,
				speed: 0.025 + Math.random() * 0.035,
				size: 3 + Math.random() * 6
			});
		}

		/** When a flying drop hits the "glass" */
		function impact(x: number, y: number, size: number) {
			// Create stuck drop
			glassDrops.push({
				x,
				y,
				radius: size * (1.2 + Math.random() * 0.8),
				velocity: 0,
				stuck: true,
				stuckTimer: 0,
				stuckThreshold: 60 + Math.random() * 120, // frames before dripping
				trail: [],
				alpha: 0.7 + Math.random() * 0.3
			});

			// Splash particles
			const count = 5 + Math.floor(Math.random() * 6);
			for (let i = 0; i < count; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = 1 + Math.random() * 3;
				splashes.push({
					x,
					y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					radius: 1 + Math.random() * 2,
					alpha: 0.8
				});
			}
		}

		/** Draw a single water drop with glass-like look */
		function drawGlassDrop(d: GlassDrop) {
			// Draw trail first
			for (const t of d.trail) {
				ctx.beginPath();
				ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(160, 200, 240, ${t.alpha * 0.25})`;
				ctx.fill();
			}

			// Main drop body — radial gradient for glass refraction look
			const r = d.radius;
			const grad = ctx.createRadialGradient(
				d.x - r * 0.3,
				d.y - r * 0.3,
				r * 0.05,
				d.x,
				d.y,
				r
			);
			grad.addColorStop(0, `rgba(220, 235, 255, ${d.alpha * 0.9})`);
			grad.addColorStop(0.3, `rgba(180, 210, 245, ${d.alpha * 0.6})`);
			grad.addColorStop(0.7, `rgba(140, 180, 225, ${d.alpha * 0.3})`);
			grad.addColorStop(1, `rgba(120, 160, 210, ${d.alpha * 0.05})`);

			ctx.beginPath();
			ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
			ctx.fillStyle = grad;
			ctx.fill();

			// Highlight — small white dot
			ctx.beginPath();
			ctx.arc(d.x - r * 0.25, d.y - r * 0.25, r * 0.2, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.7})`;
			ctx.fill();

			// Subtle edge ring
			ctx.beginPath();
			ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(180, 210, 240, ${d.alpha * 0.2})`;
			ctx.lineWidth = 0.5;
			ctx.stroke();
		}

		// --- Main loop ---

		let lastTime = performance.now();

		function animate(now: number) {
			const dt = Math.min((now - lastTime) / 16.67, 3); // normalize to ~60fps, cap
			lastTime = now;
			elapsed += dt;
			ctx.clearRect(0, 0, width, height);

			// --- Spawn flying drops in waves ---
			if (!doneSpawning) {
				spawnTimer += dt;
				// 3 waves of sprinkles
				const spawnRate = elapsed < 20 ? 2 : elapsed < 50 ? 3 : 4;
				if (spawnTimer > spawnRate && totalSpawned < maxDrops) {
					spawnTimer = 0;
					const burstSize = 2 + Math.floor(Math.random() * 3);
					for (let i = 0; i < burstSize && totalSpawned < maxDrops; i++) {
						spawnFlying();
						totalSpawned++;
					}
				}
				if (totalSpawned >= maxDrops) {
					doneSpawning = true;
				}
			}

			// --- Update & draw flying drops ---
			for (let i = flyingDrops.length - 1; i >= 0; i--) {
				const d = flyingDrops[i];
				d.progress += d.speed * dt;

				if (d.progress >= 1) {
					// Hit the glass!
					impact(d.targetX, d.targetY, d.size);
					flyingDrops.splice(i, 1);
					continue;
				}

				// Eased interpolation (accelerate toward screen)
				const t = d.progress * d.progress; // ease-in
				const x = d.originX + (d.targetX - d.originX) * t;
				const y = d.originY + (d.targetY - d.originY) * t;
				// Scale up as it "approaches" — small in center, big at target
				const scale = 0.1 + t * 0.9;
				const r = d.size * scale;

				// Draw flying drop — simple translucent circle
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				const alpha = 0.3 + t * 0.5;
				ctx.fillStyle = `rgba(180, 210, 245, ${alpha})`;
				ctx.fill();
			}

			// --- Update & draw splashes ---
			for (let i = splashes.length - 1; i >= 0; i--) {
				const s = splashes[i];
				s.x += s.vx * dt;
				s.y += s.vy * dt;
				s.vy += 0.08 * dt; // gravity
				s.alpha -= 0.025 * dt;

				if (s.alpha <= 0) {
					splashes.splice(i, 1);
					continue;
				}

				ctx.beginPath();
				ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(180, 215, 255, ${s.alpha})`;
				ctx.fill();
			}

			// --- Update & draw glass drops ---
			for (let i = glassDrops.length - 1; i >= 0; i--) {
				const d = glassDrops[i];

				if (d.stuck) {
					d.stuckTimer += dt;
					// Wobble slightly while stuck
					d.x += Math.sin(elapsed * 0.3 + i) * 0.02;

					if (d.stuckTimer > d.stuckThreshold) {
						d.stuck = false; // start dripping
					}
				} else {
					// Dripping down with gravity
					d.velocity += 0.03 * dt;
					d.velocity = Math.min(d.velocity, 3); // terminal velocity
					d.y += d.velocity * dt;

					// Slight horizontal wobble
					d.x += Math.sin(d.y * 0.05 + i) * 0.15 * dt;

					// Leave trail
					if (Math.random() < 0.4) {
						d.trail.push({
							x: d.x + (Math.random() - 0.5) * d.radius * 0.3,
							y: d.y,
							r: d.radius * (0.2 + Math.random() * 0.3),
							alpha: d.alpha * 0.6
						});
					}

					// Shrink as it drips (losing mass to trail)
					d.radius *= 1 - 0.001 * dt;
					d.alpha -= 0.002 * dt;
				}

				// Fade out trails
				for (let j = d.trail.length - 1; j >= 0; j--) {
					d.trail[j].alpha -= 0.005 * dt;
					if (d.trail[j].alpha <= 0) {
						d.trail.splice(j, 1);
					}
				}

				// Remove if off screen or too faded
				if (d.y > height + 20 || d.alpha <= 0.05) {
					glassDrops.splice(i, 1);
					continue;
				}

				drawGlassDrop(d);
			}

			// --- Check completion ---
			if (
				doneSpawning &&
				flyingDrops.length === 0 &&
				splashes.length === 0 &&
				!completeFired
			) {
				// All drops are now on glass dripping. Wait a beat then signal done.
				completeFired = true;
				setTimeout(() => onComplete(), 2000);
			}

			animId = requestAnimationFrame(animate);
		}

		animId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
		};
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none absolute inset-0 z-20"></canvas>
