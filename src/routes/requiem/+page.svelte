<script lang="ts">
	import { base } from '$app/paths';

	const examples = [
		'jQuery плагін 2014 року',
		'REST API на PHP 5.6',
		'Монорепо на 800k рядків',
		'Sprint Q3 2023',
		'Мікросервіс payments-v1',
	];

	let subject = $state('');
	let streaming = $state(false);
	let result = $state('');
	let done = $state(false);

	async function performRequiem() {
		const text = subject.trim();
		if (!text || streaming) return;

		streaming = true;
		result = '';
		done = false;

		try {
			const response = await fetch('/api/requiem', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subject: text })
			});

			if (!response.ok || !response.body) throw new Error();

			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { done: d, value } = await reader.read();
				if (d) break;
				result += decoder.decode(value, { stream: true });
			}

			done = true;
		} catch {
			result = 'Вибач, чадо. Технічна помилка. Спробуй ще раз.';
			done = true;
		} finally {
			streaming = false;
		}
	}

	function reset() {
		subject = '';
		result = '';
		done = false;
	}
</script>

<div class="flex flex-1 flex-col items-center px-4 py-8" style="min-height: 100vh;">
	<!-- Top bar -->
	<div class="mb-6 flex w-full max-w-md items-center">
		<a
			href="{base}/"
			class="font-body text-(--gold)/70 hover:text-(--gold) transition-colors text-lg no-underline"
		>
			&#8592; Назад
		</a>
	</div>

	<!-- Title -->
	<div class="mb-8 text-center">
		<div class="mb-3 text-3xl">⚰️</div>
		<h1 class="font-display text-3xl font-semibold tracking-wide text-(--gold-light) sm:text-4xl">
			Панахида
		</h1>
		<p class="font-body mt-3 text-base text-(--gold)/70 max-w-xs leading-relaxed text-center">
			Відспіваємо будь-який код, проект, реліз або технологію, що відійшли у вічність
		</p>
	</div>

	<div class="h-[1px] w-40 bg-gradient-to-r from-transparent via-(--gold)/30 to-transparent mb-8"></div>

	{#if !result}
		<!-- Input form -->
		<div class="w-full max-w-md">
			<p class="font-body text-base text-(--gold)/60 mb-4 text-center">
				Що відспіваємо, чадо?
			</p>

			<div class="relative mb-3">
				<span class="absolute inset-0 border border-(--gold) opacity-20 rounded-xl pointer-events-none"></span>
				<span class="absolute top-[-2px] left-[-2px] h-3 w-3 border-t-2 border-l-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute top-[-2px] right-[-2px] h-3 w-3 border-t-2 border-r-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute bottom-[-2px] left-[-2px] h-3 w-3 border-b-2 border-l-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute bottom-[-2px] right-[-2px] h-3 w-3 border-b-2 border-r-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<textarea
					bind:value={subject}
					placeholder="Наприклад: jQuery плагін 2014 року, Sprint Q3, мікросервіс payments-v1..."
					rows="3"
					disabled={streaming}
					class="font-body w-full resize-none rounded-xl bg-transparent px-5 py-4 text-base text-(--gold)/90 placeholder-(--gold)/40 focus:outline-none disabled:opacity-40"
				></textarea>
			</div>

			<!-- Examples -->
			<div class="mb-4 flex flex-wrap gap-2">
				{#each examples as ex}
					<button
						onclick={() => subject = ex}
						class="font-body text-sm text-(--gold)/50 border border-(--gold)/20 rounded-lg px-3 py-1 hover:border-(--gold)/50 hover:text-(--gold)/80 transition-all bg-transparent cursor-pointer"
					>
						{ex}
					</button>
				{/each}
			</div>

			<button
				onclick={performRequiem}
				disabled={streaming || !subject.trim()}
				class="font-display w-full rounded-xl border border-(--gold)/40 py-3 text-base tracking-widest text-(--gold-light) transition-all hover:border-(--gold)/70 hover:bg-(--gold)/5 disabled:cursor-not-allowed disabled:opacity-30 uppercase"
			>
				{streaming ? 'Пастор читає молитву...' : '⚰️ Відспівати'}
			</button>
		</div>
	{:else}
		<!-- Result -->
		<div class="w-full max-w-md">
			<div class="rounded-xl border border-(--gold)/20 px-6 py-5 mb-6" style="background: rgba(201,168,76,0.03);">
				<p class="font-body text-sm text-(--gold)/60 mb-3 tracking-widest uppercase">Отець Клод Дебагович</p>
				{#if streaming}
					<p class="font-body text-base text-(--gold)/90 leading-relaxed whitespace-pre-wrap">{result}<span class="animate-pulse">▊</span></p>
				{:else}
					<p class="font-body text-base text-(--gold)/90 leading-relaxed whitespace-pre-wrap">{result}</p>
				{/if}
			</div>

			{#if done}
				<!-- Donation -->
				<a
					href="https://send.monobank.ua/jar/3v3EZtAVBa"
					target="_blank"
					rel="noopener noreferrer"
					class="group mb-4 flex w-full items-center gap-3 rounded-xl border border-(--gold)/35 px-4 py-3 no-underline transition-all hover:border-(--gold)/60 hover:bg-(--gold)/5"
					style="background: rgba(201,168,76,0.04);"
				>
					<span class="text-xl">🕍</span>
					<div class="flex-1">
						<p class="font-display text-sm tracking-wide text-(--gold-light)/90">Освятити панахиду пожертвою</p>
						<p class="font-body text-xs text-(--gold)/60 mt-0.5">Обряд без пожертви — як деплой без тестів</p>
					</div>
					<span class="font-body text-sm text-(--gold)/50 group-hover:text-(--gold)/80 transition-colors">→</span>
				</a>

				<button
					onclick={reset}
					class="font-display w-full rounded-xl border border-(--gold)/25 py-3 text-base tracking-widest text-(--gold)/60 transition-all hover:border-(--gold)/50 hover:text-(--gold)/90 uppercase bg-transparent cursor-pointer"
				>
					Відспівати ще одного
				</button>
			{/if}
		</div>
	{/if}
</div>
