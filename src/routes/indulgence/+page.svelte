<script lang="ts">
	import { base } from '$app/paths';
	import IndulgenceCertificate from '$lib/components/IndulgenceCertificate.svelte';

	const examples = [
		'git push --force в main у п\'ятницю ввечері',
		'Задеплоїти без тестів, бо "і так працює"',
		'Скопіпастити код зі StackOverflow без розуміння',
		'Сказати "це займе 2 години" замість реальних 2 тижнів',
		'Закомітити .env з секретами в публічний репо',
		'Ігнорувати всі зауваження на код рев\'ю',
	];

	let subject = $state('');
	let streaming = $state(false);
	let result = $state('');
	let done = $state(false);
	let showCertificate = $state(false);

	async function requestIndulgence() {
		const text = subject.trim();
		if (!text || streaming) return;

		streaming = true;
		result = '';
		done = false;
		showCertificate = false;

		try {
			const response = await fetch('/api/indulgence', {
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
			setTimeout(() => showCertificate = true, 500);
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
		showCertificate = false;
	}
</script>

<div class="flex flex-1 flex-col items-center px-4 py-8" style="min-height: 100vh;">
	<!-- Top bar -->
	<div class="mb-6 flex w-full max-w-md items-center">
		<a
			href="{base}/"
			class="font-body text-(--gold)/90 hover:text-(--gold) transition-colors text-lg no-underline"
		>
			&#8592; Назад
		</a>
	</div>

	<!-- Title -->
	<div class="mb-8 text-center">
		<div class="mb-3 text-3xl">📜</div>
		<h1 class="font-display text-3xl font-semibold tracking-wide text-(--gold-light) sm:text-4xl">
			Індульгенція
		</h1>
		<p class="font-body mt-3 text-base text-(--gold)/90 max-w-xs leading-relaxed text-center">
			Відпущення IT-гріхів наперед
		</p>
	</div>

	<div class="h-[1px] w-40 bg-gradient-to-r from-transparent via-(--gold)/30 to-transparent mb-8"></div>

	{#if !result}
		<!-- Input form -->
		<div class="w-full max-w-md">
			<p class="font-body text-base text-(--gold)/80 mb-4 text-center">
				Який гріх плануєш скоїти, чадо?
			</p>

			<div class="relative mb-3">
				<span class="absolute inset-0 border border-(--gold) opacity-20 rounded-xl pointer-events-none"></span>
				<span class="absolute top-[-2px] left-[-2px] h-3 w-3 border-t-2 border-l-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute top-[-2px] right-[-2px] h-3 w-3 border-t-2 border-r-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute bottom-[-2px] left-[-2px] h-3 w-3 border-b-2 border-l-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute bottom-[-2px] right-[-2px] h-3 w-3 border-b-2 border-r-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<textarea
					bind:value={subject}
					placeholder="Наприклад: push --force в main, деплой без тестів, хардкод секретів..."
					rows="3"
					disabled={streaming}
					class="font-body w-full resize-none rounded-xl bg-transparent px-5 py-4 text-base text-(--gold)/90 placeholder-(--gold)/60 focus:outline-none disabled:opacity-40"
				></textarea>
			</div>

			<!-- Examples -->
			<div class="mb-4 flex flex-wrap gap-2">
				{#each examples as ex}
					<button
						onclick={() => subject = ex}
						class="font-body text-base text-(--gold)/70 border border-(--gold)/20 rounded-lg px-3 py-1 hover:border-(--gold)/50 hover:text-(--gold)/80 transition-all bg-transparent cursor-pointer"
					>
						{ex}
					</button>
				{/each}
			</div>

			<button
				onclick={requestIndulgence}
				disabled={streaming || !subject.trim()}
				class="font-display w-full rounded-xl border border-(--gold)/40 py-3 text-base tracking-widest text-(--gold-light) transition-all hover:border-(--gold)/70 hover:bg-(--gold)/5 disabled:cursor-not-allowed disabled:opacity-30 uppercase"
			>
				{streaming ? 'Пастор розглядає...' : '📜 Отримати індульгенцію'}
			</button>
		</div>
	{:else}
		<!-- Result -->
		<div class="w-full" class:max-w-md={!showCertificate} class:max-w-[840px]={showCertificate}>
			{#if showCertificate}
				<!-- Certificate -->
				<div class="mb-6" style="animation: fadeIn 0.6s ease-out;">
					<IndulgenceCertificate text={result} />
				</div>
			{:else}
				<div class="rounded-xl border border-(--gold)/20 px-6 py-5 mb-6" style="background: rgba(201,168,76,0.03);">
					<p class="font-body text-base text-(--gold)/80 mb-3 tracking-widest uppercase">Отець Клод Дебагович</p>
					{#if streaming}
						<p class="font-body text-base text-(--gold)/90 leading-relaxed whitespace-pre-wrap">{result}<span class="animate-pulse">▊</span></p>
					{:else}
						<p class="font-body text-base text-(--gold)/90 leading-relaxed whitespace-pre-wrap">{result}</p>
					{/if}
				</div>
			{/if}

			{#if done}
				<!-- Candle CTA -->
				<a
					href="{base}/candle/burn?for={encodeURIComponent('за відпущення гріхів наперед')}"
					class="group mb-3 flex w-full items-center gap-3 rounded-xl border border-(--gold)/25 px-4 py-3 no-underline transition-all hover:border-(--gold)/50 hover:bg-(--gold)/5"
					style="background: rgba(201,168,76,0.03);"
				>
					<span class="text-xl">🕯</span>
					<div class="flex-1">
						<p class="font-display text-base tracking-wide text-(--gold-light)">Поставити свічку за відпущення</p>
						<p class="font-body text-sm text-(--gold)/70 mt-0.5">Індульгенція + свічка = повний захист</p>
					</div>
					<span class="font-body text-sm text-(--gold)/40 group-hover:text-(--gold)/70 transition-colors">→</span>
				</a>

				<!-- Donation QR -->
				<div class="mt-4 mb-4 flex flex-col items-center">
					<p class="font-display mb-3 text-base tracking-widest text-(--gold)/80 uppercase">
						Підкріпити індульгенцію пожертвою
					</p>
					<a href="https://send.monobank.ua/jar/rQcpy7d5s" target="_blank" rel="noopener noreferrer" class="overflow-hidden rounded-xl border border-(--gold)/20 shadow-[0_0_20px_rgba(201,168,76,0.08)] block">
						<img
							src="{base}/deciatyna.jpg"
							alt="QR-код для пожертви"
							class="w-48 sm:w-56"
						/>
					</a>
				</div>

				<button
					onclick={reset}
					class="font-display w-full rounded-xl border border-(--gold)/25 py-3 text-base tracking-widest text-(--gold)/80 transition-all hover:border-(--gold)/50 hover:text-(--gold) uppercase bg-transparent cursor-pointer"
				>
					Ще одна індульгенція
				</button>
			{/if}
		</div>
	{/if}
</div>
