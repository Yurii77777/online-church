<script lang="ts">
	import '../app.css';
	import IncenseSmoke from '$lib/components/IncenseSmoke.svelte';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { ambientAudio } from '$lib/audioStore';

	let { children } = $props();

	onMount(() => {
		const audio = new Audio();
		audio.preload = 'none';
		audio.loop = true;
		audio.volume = 0.3;

		ambientAudio.set(audio);

		function startAmbient() {
			audio.src = `${base}/sounds/ambient-bg.mp3`;
			audio.play().catch(() => {});
			document.removeEventListener('click', startAmbient);
			document.removeEventListener('touchstart', startAmbient);
		}

		document.addEventListener('click', startAmbient);
		document.addEventListener('touchstart', startAmbient);

		return () => {
			audio.pause();
			audio.src = '';
			ambientAudio.set(null);
			document.removeEventListener('click', startAmbient);
			document.removeEventListener('touchstart', startAmbient);
		};
	});
</script>

<svelte:head>
	<title>Онлайн Церква</title>
	<meta name="description" content="Онлайн Церква — поставити свічку та отримати благословення" />
</svelte:head>

<IncenseSmoke />
<div class="min-h-screen flex flex-col">
	{@render children()}
</div>
