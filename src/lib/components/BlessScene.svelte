<script lang="ts">
	import WaterDrops from './WaterDrops.svelte';
	import BlessingText from './BlessingText.svelte';

	let phase = $state<'sprinkle' | 'blessing'>('sprinkle');
	let showText = $state(false);

	function onDropsComplete() {
		phase = 'blessing';
		setTimeout(() => {
			showText = true;
		}, 500);
	}
</script>

<div class="relative h-full w-full overflow-hidden">
	{#if phase === 'sprinkle'}
		<WaterDrops onComplete={onDropsComplete} />
	{/if}

	{#if phase === 'blessing'}
		<div class="flex h-full items-center justify-center">
			<BlessingText visible={showText} />
		</div>
	{/if}
</div>
