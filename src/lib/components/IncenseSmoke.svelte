<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	interface SmokeParticle {
		x: number;
		y: number;
		size: number;
		maxSize: number;
		opacity: number;
		maxOpacity: number;
		vx: number;
		vy: number;
		age: number;
		lifetime: number;
		warmth: number;
		driftPhase: number;
		driftPhase2: number;
		fadeInDuration: number;
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);

		const particles: SmokeParticle[] = [];
		const maxParticles = 25;
		const emitters = [0.15, 0.5, 0.85];

		let animId: number;
		let spawnCounters = [0, 0, 0];

		const resize = () => {
			width = canvas.width = window.innerWidth;
			height = canvas.height = window.innerHeight;
		};
		window.addEventListener('resize', resize);

		function spawnParticle(emitterX: number) {
			if (particles.length >= maxParticles) return;

			const size = 15 + Math.random() * 20;
			const maxSize = 60 + Math.random() * 80;

			particles.push({
				x: emitterX * width + (Math.random() - 0.5) * 40,
				y: height + size,
				size,
				maxSize,
				opacity: 0,
				maxOpacity: 0.03 + Math.random() * 0.05,
				vx: 0,
				vy: -(0.4 + Math.random() * 0.4),
				age: 0,
				lifetime: 500 + Math.random() * 400,
				warmth: 0.3 + Math.random() * 0.7,
				driftPhase: Math.random() * Math.PI * 2,
				driftPhase2: Math.random() * Math.PI * 2,
				fadeInDuration: 40 + Math.random() * 40
			});
		}

		function drawParticle(p: SmokeParticle) {
			const r = p.size;
			const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);

			const warmR = Math.floor(200 + p.warmth * 55);
			const warmG = Math.floor(160 + p.warmth * 40);
			const warmB = Math.floor(80 + p.warmth * 30);

			const a = p.opacity;
			grad.addColorStop(0, `rgba(${warmR}, ${warmG}, ${warmB}, ${a * 1.5})`);
			grad.addColorStop(0.3, `rgba(${warmR}, ${warmG}, ${warmB}, ${a})`);
			grad.addColorStop(0.7, `rgba(${warmR}, ${warmG}, ${warmB}, ${a * 0.4})`);
			grad.addColorStop(1, `rgba(${warmR}, ${warmG}, ${warmB}, 0)`);

			ctx.beginPath();
			ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
			ctx.fillStyle = grad;
			ctx.fill();
		}

		let lastTime = performance.now();

		function animate(now: number) {
			const dt = Math.min((now - lastTime) / 16.67, 3);
			lastTime = now;

			ctx.clearRect(0, 0, width, height);

			// Spawn from each emitter
			for (let i = 0; i < emitters.length; i++) {
				spawnCounters[i] += dt;
				if (spawnCounters[i] >= 40) {
					spawnCounters[i] = 0;
					spawnParticle(emitters[i]);
				}
			}

			// Update & draw particles
			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.age += dt;

				if (p.age >= p.lifetime) {
					particles.splice(i, 1);
					continue;
				}

				const lifeProgress = p.age / p.lifetime;

				// Size grows over lifetime
				p.size = p.size + (p.maxSize - p.size) * 0.003 * dt;

				// Opacity envelope: fade-in → sustain → fade-out (last 40%)
				if (p.age < p.fadeInDuration) {
					p.opacity = (p.age / p.fadeInDuration) * p.maxOpacity;
				} else if (lifeProgress > 0.6) {
					const fadeProgress = (lifeProgress - 0.6) / 0.4;
					p.opacity = p.maxOpacity * (1 - fadeProgress);
				} else {
					p.opacity = p.maxOpacity;
				}

				// Horizontal drift with two harmonics
				const drift1 = Math.sin(p.age * 0.008 + p.driftPhase) * 0.3;
				const drift2 = Math.sin(p.age * 0.003 + p.driftPhase2) * 0.5;
				p.x += (drift1 + drift2) * dt;

				// Rise
				p.y += p.vy * dt;

				drawParticle(p);
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

<canvas bind:this={canvas} class="pointer-events-none fixed inset-0 z-[1]"></canvas>
