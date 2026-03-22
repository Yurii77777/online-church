<script lang="ts">
	let { visible = false, item = '' }: { visible?: boolean; item?: string } = $props();

	const blessings = [
		'Нехай продакшн твій буде стабільним, а деплої — безгрішними',
		'Мир тобі і репозиторію твоєму',
		'Нехай CI/CD благодать буде з тобою на всіх бранчах',
		'Господь — твій load balancer і твій firewall',
		'Нехай Господь дасть тобі zero downtime і спокійний on-call',
		'Благословенний ти перед code review',
		'Нехай ангели DevOps оберігають тебе від segfault-ів',
		'Господь нехай освітить логи Свої до тебе і помилує від 500-х'
	];

	const blessing = blessings[Math.floor(Math.random() * blessings.length)];
</script>

<div
	class="flex flex-col items-center justify-center px-8 text-center transition-all duration-1500"
	class:opacity-0={!visible}
	class:opacity-100={visible}
	class:translate-y-4={!visible}
	class:translate-y-0={visible}
>
	<!-- Decorative cross -->
	<div class="mb-6 text-3xl text-(--gold)/60">✝</div>

	<!-- Blessing text -->
	<p class="font-display max-w-lg text-2xl leading-relaxed font-semibold tracking-wide text-(--gold-light) sm:text-3xl">
		{blessing}
	</p>

	<!-- Decorative line -->
	<div class="mt-6 h-[1px] w-32 bg-gradient-to-r from-transparent via-(--gold)/50 to-transparent"></div>

	<!-- Item that was blessed -->
	{#if item}
		<p class="font-body mt-4 text-base tracking-wide text-(--gold)/40">
			Посвячено: {item}
		</p>
	{/if}

	<!-- Amen -->
	<p class="font-body mt-3 text-lg tracking-[0.3em] text-(--gold)/50">
		АМІНЬ // TODO: more faith
	</p>
</div>
