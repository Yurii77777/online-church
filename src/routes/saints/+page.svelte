<script lang="ts">
	import { base } from '$app/paths';
	import { SAINTS } from '$lib/constants';

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
			class="font-body text-(--gold)/90 hover:text-(--gold) transition-colors text-lg no-underline"
		>
			&#8592; Назад
		</a>
	</div>

	<!-- Title -->
	<div class="mb-10 text-center">
		<h1 class="font-display text-3xl font-semibold tracking-wide text-(--gold-light) sm:text-4xl">
			📜 Книга Святих
		</h1>
		<p class="font-body mt-3 text-base tracking-wide text-(--gold)/90 max-w-sm leading-relaxed">
			CONTRIBUTORS.md вічної слави для тих, хто підтримав Онлайн Церкву
		</p>
	</div>

	<!-- Saints list -->
	<ul class="flex flex-col items-center gap-4 mb-6 list-none p-0 m-0">
		{#each SAINTS as name}
			<li class="group relative block w-72 px-8 py-5 text-center">
				<span class="absolute inset-0 border border-(--gold) opacity-60"></span>
				<span class="absolute inset-[3px] border border-(--gold) opacity-30"></span>
				<span class="absolute top-[-2px] left-[-2px] h-3 w-3 border-t-2 border-l-2 border-(--gold-light) opacity-70"></span>
				<span class="absolute top-[-2px] right-[-2px] h-3 w-3 border-t-2 border-r-2 border-(--gold-light) opacity-70"></span>
				<span class="absolute bottom-[-2px] left-[-2px] h-3 w-3 border-b-2 border-l-2 border-(--gold-light) opacity-70"></span>
				<span class="absolute bottom-[-2px] right-[-2px] h-3 w-3 border-b-2 border-r-2 border-(--gold-light) opacity-70"></span>
				<span class="font-display relative z-10 text-xl tracking-wider text-(--gold-light)">
					{name}
				</span>
			</li>
		{/each}
	</ul>

	<!-- CTA to join -->
	<div class="w-full max-w-sm text-center mb-6">
		<p class="font-body text-base leading-relaxed text-(--gold)/70">
			Кожен хто зробить пожертву — отримає вічний merge у цю святу книгу.
		</p>
	</div>

	<!-- Divider -->
	<div class="mt-6 h-[1px] w-40 bg-gradient-to-r from-transparent via-(--gold)/30 to-transparent"></div>

	<!-- CTA -->
	<div class="mt-8 mb-4 text-center">
		<p class="font-display text-lg tracking-wide text-(--gold-light)">
			Зробити git push до Книги Святих
		</p>
		<p class="font-body mt-2 text-base text-(--gold)/80">
			Підтримай храм та залиш свій commit у вічності
		</p>
	</div>

	<!-- Donation QR -->
	<div id="donate" class="mt-4 mb-8 flex flex-col items-center">
		<p class="font-display mb-3 text-base tracking-widest text-(--gold)/80 uppercase">
			{randomPhrase}
		</p>
		<a href="https://send.monobank.ua/jar/3v3EZtAVBa" target="_blank" rel="noopener noreferrer" class="overflow-hidden rounded-xl border border-(--gold)/20 shadow-[0_0_20px_rgba(201,168,76,0.08)] block">
			<img
				src="{base}/deciatyna.jpg"
				alt="QR-код для пожертви"
				class="w-48 sm:w-56"
			/>
		</a>
	</div>
</div>
