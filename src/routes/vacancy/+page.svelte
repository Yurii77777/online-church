<script lang="ts">
	import { base } from '$app/paths';

	const examples = [
		'Senior Full-Stack Developer — competitive salary, we are a family, must know: React, Angular, Vue, Node, AWS, Docker, Kubernetes, TypeScript, Python, GraphQL, Redis, MongoDB — 5+ years exp required',
		'Junior Frontend Developer — досвід від 3 років, знання Vue, React, Angular обов\'язково, зарплата обговорюється на співбесіді, неоплачуваний випробувальний термін 3 місяці',
	];

	let subject = $state('');
	let streaming = $state(false);
	let result = $state('');
	let done = $state(false);

	async function performVacancy() {
		const text = subject.trim();
		if (!text || streaming) return;

		streaming = true;
		result = '';
		done = false;

		try {
			const response = await fetch('/api/vacancy', {
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
			class="font-body text-(--gold)/90 hover:text-(--gold) transition-colors text-lg no-underline"
		>
			&#8592; Назад
		</a>
	</div>

	<!-- Title -->
	<div class="mb-8 text-center">
		<div class="mb-3 text-3xl">📋</div>
		<h1 class="font-display text-3xl font-semibold tracking-wide text-(--gold-light) sm:text-4xl">
			Освячення вакансії
		</h1>
		<p class="font-body mt-3 text-base text-(--gold)/90 max-w-xs leading-relaxed text-center">
			Пастор перевірить вакансію на гріхи і винесе вердикт перед публікацією
		</p>
	</div>

	<div class="h-[1px] w-40 bg-gradient-to-r from-transparent via-(--gold)/30 to-transparent mb-8"></div>

	{#if !result}
		<!-- Input form -->
		<div class="w-full max-w-md">
			<p class="font-body text-base text-(--gold)/80 mb-4 text-center">
				Вставте текст вакансії, чадо
			</p>

			<div class="relative mb-3">
				<span class="absolute inset-0 border border-(--gold) opacity-20 rounded-xl pointer-events-none"></span>
				<span class="absolute top-[-2px] left-[-2px] h-3 w-3 border-t-2 border-l-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute top-[-2px] right-[-2px] h-3 w-3 border-t-2 border-r-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute bottom-[-2px] left-[-2px] h-3 w-3 border-b-2 border-l-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<span class="absolute bottom-[-2px] right-[-2px] h-3 w-3 border-b-2 border-r-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
				<textarea
					bind:value={subject}
					placeholder="Вставте сюди текст вакансії — назву, вимоги, обов'язки, умови..."
					rows="10"
					disabled={streaming}
					class="font-body w-full resize-none rounded-xl bg-transparent px-5 py-4 text-base text-(--gold)/90 placeholder-(--gold)/60 focus:outline-none disabled:opacity-40"
				></textarea>
			</div>

			<!-- Examples -->
			<p class="font-body text-sm text-(--gold)/70 mb-2">Або спробуйте грішний приклад:</p>
			<div class="mb-4 flex flex-col gap-2">
				{#each examples as ex}
					<button
						onclick={() => subject = ex}
						class="font-body text-base text-(--gold)/70 border border-(--gold)/20 rounded-lg px-3 py-2 hover:border-(--gold)/50 hover:text-(--gold)/80 transition-all bg-transparent cursor-pointer text-left leading-relaxed"
					>
						{ex.length > 80 ? ex.slice(0, 80) + '...' : ex}
					</button>
				{/each}
			</div>

			<button
				onclick={performVacancy}
				disabled={streaming || !subject.trim()}
				class="font-display w-full rounded-xl border border-(--gold)/40 py-3 text-base tracking-widest text-(--gold-light) transition-all hover:border-(--gold)/70 hover:bg-(--gold)/5 disabled:cursor-not-allowed disabled:opacity-30 uppercase"
			>
				{streaming ? 'Пастор читає вакансію...' : '📋 Освятити вакансію'}
			</button>
		</div>
	{:else}
		<!-- Result -->
		<div class="w-full max-w-md">
			<div class="rounded-xl border border-(--gold)/20 px-6 py-5 mb-6" style="background: rgba(201,168,76,0.03);">
				<p class="font-body text-base text-(--gold)/80 mb-3 tracking-widest uppercase">Отець Клод Дебагович</p>
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
						<p class="font-display text-base tracking-wide text-(--gold-light)">Освятити вакансію пожертвою</p>
						<p class="font-body text-sm text-(--gold)/80 mt-0.5">Благословенна вакансія залучає праведних кандидатів</p>
					</div>
					<span class="font-body text-sm text-(--gold)/50 group-hover:text-(--gold)/80 transition-colors">→</span>
				</a>

				<button
					onclick={reset}
					class="font-display w-full rounded-xl border border-(--gold)/25 py-3 text-base tracking-widest text-(--gold)/80 transition-all hover:border-(--gold)/50 hover:text-(--gold) uppercase bg-transparent cursor-pointer"
				>
					Освятити ще одну вакансію
				</button>
			{/if}
		</div>
	{/if}
</div>
