<script lang="ts">
	import { base } from '$app/paths';

	let { href, label, icon = '' }: { href: string; label: string; icon?: string } = $props();
</script>

<a
	href="{base}{href}"
	class="group relative block w-72 px-8 py-5 text-center no-underline transition-all duration-500"
>
	<!-- Outer gold border -->
	<span
		class="absolute inset-0 border border-[var(--gold)] opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:shadow-[0_0_30px_rgba(201,168,76,0.3)]"
	></span>

	<!-- Inner border -->
	<span
		class="absolute inset-[3px] border border-[var(--gold)] opacity-30 transition-opacity duration-500 group-hover:opacity-60"
	></span>

	<!-- Corner ornaments -->
	<span class="absolute top-[-2px] left-[-2px] h-3 w-3 border-t-2 border-l-2 border-[var(--gold-light)] opacity-70"></span>
	<span class="absolute top-[-2px] right-[-2px] h-3 w-3 border-t-2 border-r-2 border-[var(--gold-light)] opacity-70"></span>
	<span class="absolute bottom-[-2px] left-[-2px] h-3 w-3 border-b-2 border-l-2 border-[var(--gold-light)] opacity-70"></span>
	<span class="absolute bottom-[-2px] right-[-2px] h-3 w-3 border-b-2 border-r-2 border-[var(--gold-light)] opacity-70"></span>

	<!-- Text -->
	<span class="font-display relative z-10 text-xl whitespace-nowrap tracking-wider text-[var(--gold-light)] transition-all duration-500 group-hover:text-white group-hover:tracking-widest">
		{#if icon}<span class="mr-2">{icon}</span>{/if}{label}
	</span>

	<!-- Glow line at bottom -->
	<span
		class="absolute bottom-0 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent transition-all duration-500 group-hover:w-full"
	></span>
</a>
