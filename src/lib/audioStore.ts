import { writable } from 'svelte/store';

export const ambientAudio = writable<HTMLAudioElement | null>(null);
