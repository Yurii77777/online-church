<script lang="ts">
	import { base } from '$app/paths';

	type Message = { role: 'user' | 'assistant'; content: string };

	let messages = $state<Message[]>([]);
	let input = $state('');
	let streaming = $state(false);
	let streamingContent = $state('');
	let scrollEl = $state<HTMLElement | null>(null);

	$effect(() => {
		if (scrollEl && (messages.length || streamingContent)) {
			scrollEl.scrollTop = scrollEl.scrollHeight;
		}
	});

	async function confess() {
		const text = input.trim();
		if (!text || streaming) return;

		input = '';
		messages = [...messages, { role: 'user', content: text }];
		streaming = true;
		streamingContent = '';

		try {
			const response = await fetch('/api/confess', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages })
			});

			if (!response.ok || !response.body) throw new Error('Сервер не відповідає');

			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				streamingContent += decoder.decode(value, { stream: true });
			}

			messages = [...messages, { role: 'assistant', content: streamingContent }];
		} catch (e) {
			messages = [
				...messages,
				{ role: 'assistant', content: 'Вибач, чадо. Технічна помилка у храмі. Спробуй ще раз.' }
			];
		} finally {
			streaming = false;
			streamingContent = '';
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			confess();
		}
	}
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
	<div class="mb-8 text-center">
		<div class="mb-3 text-3xl">🙏</div>
		<h1 class="font-display text-3xl font-semibold tracking-wide text-(--gold-light) sm:text-4xl">
			Сповідальня
		</h1>
		<p class="font-body mt-3 text-base tracking-wide text-(--gold)/90 max-w-xs leading-relaxed">
			Отець Клод Дебагович слухає твої IT-гріхи і відпускає їх
		</p>
	</div>

	<!-- Divider -->
	<div class="mb-6 h-[1px] w-40 bg-gradient-to-r from-transparent via-(--gold)/30 to-transparent"></div>

	<!-- Conversation -->
	<div
		bind:this={scrollEl}
		class="flex w-full max-w-md flex-1 flex-col gap-4 overflow-y-auto pb-4"
		style="max-height: 50vh; min-height: 200px;"
	>
		{#if messages.length === 0 && !streaming}
			<div class="flex flex-col items-center justify-center py-8 text-center opacity-60">
				<p class="font-body text-base text-(--gold) leading-relaxed">
					Натисни «Сповідатись» і розкажи пастору про свої гріхи
				</p>
			</div>
		{/if}

		{#each messages as msg}
			{#if msg.role === 'user'}
				<div class="flex justify-end">
					<div class="max-w-[80%] rounded-xl bg-(--gold)/10 border border-(--gold)/20 px-4 py-3">
						<p class="font-body text-base text-(--gold)/90 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
					</div>
				</div>
			{:else}
				<div class="flex justify-start gap-3">
					<div class="mt-1 flex-shrink-0 text-lg opacity-60">✝</div>
					<div class="max-w-[85%] rounded-xl border border-(--gold)/15 px-4 py-3" style="background: rgba(201,168,76,0.04);">
						<p class="font-body text-base text-(--gold)/80 mb-1 tracking-widest uppercase">Отець Клод Дебагович</p>
						<p class="font-body text-base text-(--gold)/90 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
					</div>
				</div>
			{/if}
		{/each}

		{#if streaming}
			<div class="flex justify-start gap-3">
				<div class="mt-1 flex-shrink-0 text-lg opacity-60">✝</div>
				<div class="max-w-[85%] rounded-xl border border-(--gold)/15 px-4 py-3" style="background: rgba(201,168,76,0.04);">
					<p class="font-body text-base text-(--gold)/80 mb-1 tracking-widest uppercase">Отець Клод Дебагович</p>
					{#if streamingContent}
						<p class="font-body text-base text-(--gold)/90 leading-relaxed whitespace-pre-wrap">{streamingContent}<span class="animate-pulse">▊</span></p>
					{:else}
						<p class="font-body text-base text-(--gold)/80 italic">роздумує над твоїми гріхами<span class="animate-pulse">...</span></p>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Divider -->
	<div class="my-4 h-[1px] w-full max-w-md bg-gradient-to-r from-transparent via-(--gold)/20 to-transparent"></div>

	<!-- Donation QR -->
	<div class="mt-4 mb-4 flex flex-col items-center w-full max-w-md">
		<p class="font-display mb-3 text-base tracking-widest text-(--gold)/80 uppercase">
			Підтримати храм
		</p>
		<a href="https://send.monobank.ua/jar/rQcpy7d5s" target="_blank" rel="noopener noreferrer" class="overflow-hidden rounded-xl border border-(--gold)/20 shadow-[0_0_20px_rgba(201,168,76,0.08)] block">
			<img
				src="{base}/deciatyna.jpg"
				alt="QR-код для пожертви"
				class="w-48 sm:w-56"
			/>
		</a>
	</div>

	<!-- Input area -->
	<div class="w-full max-w-md">
		<div class="relative">
			<span class="absolute inset-0 border border-(--gold) opacity-20 rounded-xl pointer-events-none"></span>
			<span class="absolute inset-[2px] border border-(--gold) opacity-10 rounded-[10px] pointer-events-none"></span>
			<span class="absolute top-[-2px] left-[-2px] h-3 w-3 border-t-2 border-l-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
			<span class="absolute top-[-2px] right-[-2px] h-3 w-3 border-t-2 border-r-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
			<span class="absolute bottom-[-2px] left-[-2px] h-3 w-3 border-b-2 border-l-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
			<span class="absolute bottom-[-2px] right-[-2px] h-3 w-3 border-b-2 border-r-2 border-(--gold-light) opacity-50 pointer-events-none"></span>
			<textarea
				bind:value={input}
				onkeydown={onKeydown}
				placeholder="Зізнайся у своїх гріхах, чадо..."
				rows="3"
				disabled={streaming}
				class="font-body w-full resize-none rounded-xl bg-transparent px-5 py-4 text-base text-(--gold)/90 placeholder-(--gold)/60 focus:outline-none disabled:opacity-40"
			></textarea>
		</div>

		<button
			onclick={confess}
			disabled={streaming || !input.trim()}
			class="font-display mt-3 w-full rounded-xl border border-(--gold)/40 py-3 text-base tracking-widest text-(--gold-light) transition-all hover:border-(--gold)/70 hover:bg-(--gold)/5 disabled:cursor-not-allowed disabled:opacity-30 uppercase"
		>
			{streaming ? 'Пастор слухає...' : '✝ Сповідатись'}
		</button>

		<p class="mt-3 text-center font-body text-base text-(--gold)/70">
			Enter — надіслати · Shift+Enter — новий рядок
		</p>
	</div>
</div>
