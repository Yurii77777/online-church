<script lang="ts">
	import { base } from '$app/paths';

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
	<div class="mb-10 text-center">
		<h1 class="font-display text-3xl font-semibold tracking-wide text-[var(--gold-light)] sm:text-4xl">
			📜 Книга Святих
		</h1>
		<p class="font-body mt-3 text-base tracking-wide text-[var(--gold)]/50 max-w-sm leading-relaxed">
			CONTRIBUTORS.md вічної слави для тих, хто підтримав Онлайн Церкву
		</p>
	</div>

	<!-- Empty state + CTA -->
	<div class="w-full max-w-sm text-center mb-6">
		<p class="font-body text-5xl mb-4 opacity-30">📖</p>
		<p class="font-body text-lg leading-relaxed text-[var(--gold)]/50">
			git log поки порожній, але чекає на перші коміти.
			Кожен хто зробить пожертву — отримає вічний merge у цю святу книгу.
		</p>
	</div>

	<!-- Divider -->
	<div class="mt-6 h-[1px] w-40 bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent"></div>

	<!-- CTA -->
	<div class="mt-8 mb-4 text-center">
		<p class="font-display text-lg tracking-wide text-[var(--gold-light)]/70">
			Зробити git push до Книги Святих
		</p>
		<p class="font-body mt-2 text-sm text-[var(--gold)]/40">
			Підтримай храм та залиш свій commit у вічності
		</p>
	</div>

	<!-- Donation QR -->
	<div id="donate" class="mt-4 mb-8 flex flex-col items-center">
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
