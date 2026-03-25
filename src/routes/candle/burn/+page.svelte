<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import CandleScene from '$lib/components/CandleScene.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { audioManager } from '$lib/utils/audio';

	let muted = $state(false);
	let showNudge = $state(false);

	const intention = $derived(
		$page.url.searchParams.get('for') || 'ваші молитви'
	);

	onMount(() => {
		audioManager.play('candle', true);
		const nudgeTimer = setTimeout(() => {
			showNudge = true;
		}, 5000);
		return () => clearTimeout(nudgeTimer);
	});

	onDestroy(() => {
		audioManager.stop('candle');
	});

	function toggleMute() {
		muted = !muted;
		audioManager.setMute(muted);
	}
</script>

<div class="relative flex flex-1 flex-col" style="min-height: 100vh;">
	<!-- Top bar -->
	<div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
		<a
			href="{base}/candle"
			class="font-body text-(--gold)/90 hover:text-(--gold) transition-colors text-lg no-underline"
		>
			&#8592; Назад
		</a>
		<button
			onclick={toggleMute}
			class="text-(--gold)/90 hover:text-(--gold) transition-colors text-xl bg-transparent border-none cursor-pointer"
		>
			{muted ? '🔇' : '🔊'}
		</button>
	</div>

	<!-- 3D Scene -->
	<div class="flex-1">
		<CandleScene />
	</div>

	<!-- Donation nudge -->
	{#if showNudge}
		<div class="absolute bottom-16 left-0 right-0 z-10 text-center px-6 animate-[fadeIn_1.5s_ease-in-out]">
			<p class="font-body text-base text-(--gold)/80">
				Свічка горить яскравіше з пожертвою. Premium tier 😇
			</p>
			<div class="mt-1 flex flex-col items-center gap-1">
				<a href="{base}/candle#donate" class="font-body text-base text-(--gold)/70 hover:text-(--gold)/80 transition-colors no-underline">
					Підтримати храм
				</a>
				<a href="{base}/saints" class="font-body text-base text-(--gold)/70 hover:text-(--gold)/80 transition-colors no-underline">
					Потрап до Книги Святих →
				</a>
			</div>
		</div>
	{/if}

	<!-- Bottom text with intention -->
	<div class="absolute bottom-0 left-0 right-0 z-10 pb-8 text-center px-6">
		<p class="font-display text-(--gold-light) text-lg tracking-widest">
			Свічка горить {intention}
		</p>
	</div>
</div>
