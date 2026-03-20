import { Howl } from 'howler';
import { base } from '$app/paths';

type SoundName = 'candle' | 'water' | 'bell';

class AudioManager {
	private sounds: Map<SoundName, Howl> = new Map();
	private initialized = false;
	private muted = false;

	private init() {
		if (this.initialized) return;
		this.initialized = true;

		this.sounds.set(
			'candle',
			new Howl({
				src: [`${base}/sounds/candle-crackle.mp3`],
				loop: true,
				volume: 0.3
			})
		);

		this.sounds.set(
			'water',
			new Howl({
				src: [`${base}/sounds/water-splash.mp3`],
				volume: 0.5
			})
		);

		this.sounds.set(
			'bell',
			new Howl({
				src: [`${base}/sounds/church-bell.mp3`],
				volume: 0.2
			})
		);
	}

	play(name: SoundName, loop = false) {
		this.init();
		const sound = this.sounds.get(name);
		if (sound) {
			sound.loop(loop);
			sound.play();
		}
	}

	stop(name: SoundName) {
		const sound = this.sounds.get(name);
		if (sound) {
			sound.stop();
		}
	}

	setMute(muted: boolean) {
		this.muted = muted;
		this.sounds.forEach((sound) => {
			sound.mute(muted);
		});
	}

	isMuted() {
		return this.muted;
	}
}

export const audioManager = new AudioManager();
