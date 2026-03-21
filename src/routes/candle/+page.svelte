<script lang="ts">
	import { base } from '$app/paths';

	const intentions = [
		{ icon: '🚀', label: 'За успішний деплой' },
		{ icon: '🐛', label: 'За код без багів' },
		{ icon: '📈', label: 'За успішний перфоманс рев\'ю' },
		{ icon: '🏗️', label: 'За стабільний прод' },
		{ icon: '⚡', label: 'За швидкий CI/CD' },
		{ icon: '🤝', label: 'За merge без конфліктів' },
		{ icon: '😴', label: 'За тихий on-call' },
		{ icon: '🧹', label: 'За закриття техборгу' },
		{ icon: '✅', label: 'За 100% coverage' },
		{ icon: '🙏', label: 'За нормального PM-а' },
		{ icon: '🏖️', label: 'За відпустку без алертів' },
		{ icon: '💀', label: 'За смерть legacy коду' },
		{ icon: '⛪', label: 'За процвітання цього храму', special: true },
	];

	const donationPhrases = [
		'На сервер для Господа',
		'На AWS для раю',
		'Кожен донат = -1 баг у проді',
		'Господь бачить твій git blame',
		'На CDN для святих образів',
		'Деплой на небеса потребує спонсора',
		'Твій донат — твій pull request до раю',
	];

	const randomPhrase = donationPhrases[Math.floor(Math.random() * donationPhrases.length)];
</script>

<div class="flex flex-1 flex-col items-center px-4 py-8" style="min-height: 100vh;">
	<!-- Top bar -->
	<div class="mb-6 flex w-full max-w-md items-center justify-between">
		<a
			href="{base}/"
			class="font-body text-[var(--gold)]/70 hover:text-[var(--gold)] transition-colors text-lg no-underline"
		>
			&#8592; Назад
		</a>
	</div>

	<!-- Title -->
	<div class="mb-8 text-center">
		<h1 class="font-display text-2xl font-semibold tracking-wide text-[var(--gold-light)] sm:text-3xl">
			🕯 Поставити свічку
		</h1>
		<p class="font-body mt-2 text-base tracking-wide text-[var(--gold)]/50">
			Обери свій prayer request
		</p>
	</div>

	<!-- Intentions grid -->
	<div class="w-full max-w-md flex flex-col gap-3">
		{#each intentions as item}
			{#if item.special}
				<a
					href="#donate"
					class="group flex items-center gap-4 rounded-lg border border-[var(--gold)]/50 bg-[var(--gold)]/5 px-5 py-4 no-underline transition-all duration-300 hover:border-[var(--gold)]/80 hover:bg-[var(--gold)]/10 shadow-[0_0_15px_rgba(201,168,76,0.1)] hover:shadow-[0_0_25px_rgba(201,168,76,0.25)]"
				>
					<span class="text-2xl">{item.icon}</span>
					<span class="font-body text-lg tracking-wide text-[var(--gold)] transition-colors group-hover:text-[var(--gold-light)]">
						{item.label}
					</span>
				</a>
			{:else}
				<a
					href="{base}/candle/burn?for={encodeURIComponent(item.label.toLowerCase())}"
					class="group flex items-center gap-4 rounded-lg border border-[var(--gold)]/15 px-5 py-4 no-underline transition-all duration-300 hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
				>
					<span class="text-2xl">{item.icon}</span>
					<span class="font-body text-lg tracking-wide text-[var(--gold-light)]/80 transition-colors group-hover:text-[var(--gold-light)]">
						{item.label}
					</span>
				</a>
			{/if}
		{/each}
	</div>

	<!-- Divider -->
	<div class="mt-10 h-[1px] w-40 bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent"></div>

	<!-- Donation QR -->
	<div id="donate" class="mt-8 mb-8 flex flex-col items-center">
		<p class="font-display mb-3 text-sm tracking-widest text-[var(--gold)]/40 uppercase">
			{randomPhrase}
		</p>
		<a href="https://send.monobank.ua/jar/3v3EZtAVBa" target="_blank" rel="noopener noreferrer" class="overflow-hidden rounded-xl border border-[var(--gold)]/20 shadow-[0_0_20px_rgba(201,168,76,0.08)] block">
			<img
				src="{base}/banka.jpg"
				alt="QR-код для пожертви"
				class="w-48 sm:w-56"
			/>
		</a>
	</div>
</div>
