<script lang="ts">
	import { base } from '$app/paths';
	import ChurchButton from '$lib/components/ChurchButton.svelte';

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

<div class="flex flex-1 flex-col items-center px-4 py-10">
	<!-- Deacon photo -->
	<div class="mb-8 flex flex-col items-center">
		<div class="relative h-36 w-36 overflow-hidden rounded-full border-2 border-[var(--gold)]/40 shadow-[0_0_25px_rgba(201,168,76,0.15)] sm:h-44 sm:w-44">
			<img
				src="{base}/diak.jpg"
				alt="Святий Преподобний Дяк Юрій"
				class="h-full w-full object-cover object-top"
			/>
		</div>
		<p class="font-display mt-3 text-sm tracking-wider text-[var(--gold)]/50">
			Lead Spiritual Engineer
		</p>
	</div>

	<!-- Cross / Logo -->
	<div class="mb-10 flex flex-col items-center">
		<svg
			width="40"
			height="56"
			viewBox="0 0 60 80"
			fill="none"
			class="mb-4 opacity-60"
		>
			<rect x="27" y="0" width="6" height="80" rx="1" fill="url(#crossGrad)" />
			<rect x="12" y="18" width="36" height="5" rx="1" fill="url(#crossGrad)" />
			<rect x="16" y="58" width="28" height="4" rx="1" fill="url(#crossGrad)" transform="rotate(-15 30 60)" />
			<defs>
				<linearGradient id="crossGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="var(--gold-light)" />
					<stop offset="100%" stop-color="var(--gold-dark)" />
				</linearGradient>
			</defs>
		</svg>

		<h1 class="font-display text-3xl font-semibold tracking-wide text-[var(--gold-light)] sm:text-4xl">
			Онлайн Церква
		</h1>
		<p class="font-body mt-2 text-lg tracking-wide text-[var(--gold)]/60">
			Тиша. Молитва. Uptime 99.9%.
		</p>
	</div>

	<!-- Buttons -->
	<div class="flex flex-col items-center gap-6">
		<ChurchButton href="/candle" icon="🕯" label="Поставити свічку" />
		<ChurchButton href="/bless" icon="✝" label="Посвятити" />
		<ChurchButton href="/saints" icon="📜" label="Книга Святих" />
	</div>

	<!-- Divider -->
	<div class="mt-10 h-[1px] w-40 bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent"></div>

	<!-- Donation QR -->
	<div id="donate" class="mt-8 flex flex-col items-center">
		<p class="font-display mb-3 text-sm tracking-widest text-[var(--gold)]/40 uppercase">
			{randomPhrase}
		</p>
		<div class="overflow-hidden rounded-xl border border-[var(--gold)]/20 shadow-[0_0_20px_rgba(201,168,76,0.08)]">
			<img
				src="{base}/banka.jpg"
				alt="QR-код для пожертви"
				class="w-48 sm:w-56"
			/>
		</div>
	</div>
</div>
