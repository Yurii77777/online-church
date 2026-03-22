import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { PASTOR_PROMPT } from '$lib/constants';

const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

export const POST: RequestHandler = async ({ request }) => {
	const { messages } = await request.json();

	const result = streamText({
		model: openai(env.OPENAI_MODEL ?? 'gpt-4o'),
		system: PASTOR_PROMPT,
		messages
	});

	return result.toTextStreamResponse();
};
