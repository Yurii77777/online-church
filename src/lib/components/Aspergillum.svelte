<script lang="ts">
	import { onMount } from 'svelte';

	let { animating = true }: { animating?: boolean } = $props();

	let x = $state(0);
	let y = $state(0);
	let rotation = $state(0);
	let visible = $state(false);
	let frame = 0;

	onMount(() => {
		visible = true;
		const startTime = Date.now();

		function animate() {
			if (!animating) return;

			const elapsed = (Date.now() - startTime) / 1000;
			frame++;

			// Sweep motion across the screen
			const progress = Math.min(elapsed / 2.5, 1);
			x = -20 + progress * 120; // sweep from left to right (percentage)
			y = 25 + Math.sin(elapsed * 4) * 8; // up-down motion

			// Flicking motion
			rotation = Math.sin(elapsed * 6) * 25;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				visible = false;
			}
		}

		requestAnimationFrame(animate);
	});
</script>

{#if visible}
	<div
		class="pointer-events-none fixed z-30 transition-opacity duration-300"
		style="left: {x}%; top: {y}%; transform: rotate({rotation}deg); opacity: {animating ? 1 : 0};"
	>
		<!-- SVG Aspergillum (simplified holy water sprinkler) -->
		<svg width="120" height="30" viewBox="0 0 120 30" fill="none">
			<!-- Handle -->
			<rect x="0" y="12" width="80" height="6" rx="3" fill="#8b7355" />
			<rect x="0" y="12" width="80" height="6" rx="3" fill="url(#handleGrad)" />

			<!-- Head (brush part) -->
			<ellipse cx="95" cy="15" rx="22" ry="12" fill="#6b5b45" />
			<ellipse cx="95" cy="15" rx="20" ry="10" fill="#7b6b55" />

			<!-- Bristle lines -->
			{#each Array(7) as _, i}
				<line
					x1={82 + i * 4}
					y1={8}
					x2={82 + i * 4}
					y2={22}
					stroke="#5a4a35"
					stroke-width="1"
					opacity="0.6"
				/>
			{/each}

			<!-- Gold band -->
			<rect x="76" y="10" width="5" height="10" rx="1" fill="var(--gold)" opacity="0.7" />

			<defs>
				<linearGradient id="handleGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="rgba(255,255,255,0.15)" />
					<stop offset="100%" stop-color="rgba(0,0,0,0.1)" />
				</linearGradient>
			</defs>
		</svg>
	</div>
{/if}
