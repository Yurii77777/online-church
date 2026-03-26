<script lang="ts">
	interface Props {
		text: string;
	}

	let { text }: Props = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let downloading = $state(false);

	const WIDTH = 800;
	const HEIGHT = 1100;

	function drawCertificate(canvas: HTMLCanvasElement, content: string) {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = WIDTH * dpr;
		canvas.height = HEIGHT * dpr;
		canvas.style.width = `${WIDTH}px`;
		canvas.style.height = `${HEIGHT}px`;

		const ctx = canvas.getContext('2d')!;
		ctx.scale(dpr, dpr);

		// === Parchment background ===
		const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
		bgGrad.addColorStop(0, '#f5e6c8');
		bgGrad.addColorStop(0.3, '#f0ddb8');
		bgGrad.addColorStop(0.6, '#e8d1a0');
		bgGrad.addColorStop(1, '#dfc48e');
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		// Vignette
		const vignetteGrad = ctx.createRadialGradient(
			WIDTH / 2, HEIGHT / 2, WIDTH * 0.3,
			WIDTH / 2, HEIGHT / 2, WIDTH * 0.85
		);
		vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
		vignetteGrad.addColorStop(1, 'rgba(80,50,20,0.15)');
		ctx.fillStyle = vignetteGrad;
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		// Noise texture
		const rng = mulberry32(42);
		for (let i = 0; i < 15000; i++) {
			const x = rng() * WIDTH;
			const y = rng() * HEIGHT;
			const alpha = rng() * 0.06;
			const size = rng() * 1.5 + 0.5;
			ctx.fillStyle = rng() > 0.5 ? `rgba(90,60,20,${alpha})` : `rgba(255,240,200,${alpha})`;
			ctx.fillRect(x, y, size, size);
		}

		// Random stains
		for (let i = 0; i < 3; i++) {
			const sx = 100 + rng() * (WIDTH - 200);
			const sy = 100 + rng() * (HEIGHT - 200);
			const sr = 30 + rng() * 60;
			const stainGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
			stainGrad.addColorStop(0, 'rgba(120,80,30,0.04)');
			stainGrad.addColorStop(1, 'rgba(120,80,30,0)');
			ctx.fillStyle = stainGrad;
			ctx.beginPath();
			ctx.arc(sx, sy, sr, 0, Math.PI * 2);
			ctx.fill();
		}

		// === Gold frame ===
		// Outer
		ctx.strokeStyle = '#b8952e';
		ctx.lineWidth = 3;
		roundRect(ctx, 20, 20, WIDTH - 40, HEIGHT - 40, 4);
		ctx.stroke();

		// Inner
		ctx.strokeStyle = '#e0c366';
		ctx.lineWidth = 1.5;
		roundRect(ctx, 32, 32, WIDTH - 64, HEIGHT - 64, 3);
		ctx.stroke();

		// Corner ornaments
		drawCornerOrnaments(ctx);

		// === Orthodox cross ===
		const crossY = 70;
		drawOrthodoxCross(ctx, WIDTH / 2, crossY, 0.8);

		// === Title ===
		ctx.textAlign = 'center';
		ctx.fillStyle = '#5a3a12';
		ctx.font = '600 38px "Playfair Display", Georgia, serif';
		ctx.fillText('ІНДУЛЬГЕНЦІЯ', WIDTH / 2, 155);

		// Subtitle
		ctx.font = '500 16px "Cormorant Garamond", Georgia, serif';
		ctx.fillStyle = '#7a5a2a';
		ctx.fillText('Онлайн Церква Розробників', WIDTH / 2, 180);

		// Decorative divider
		drawDivider(ctx, WIDTH / 2, 200, 200);

		// === Body text ===
		ctx.textAlign = 'left';
		ctx.font = '17px "Cormorant Garamond", Georgia, serif';
		ctx.fillStyle = '#3a2a10';

		const marginX = 65;
		const textWidth = WIDTH - marginX * 2;
		const lineHeight = 26;
		let currentY = 240;

		const lines = wrapText(ctx, content, textWidth);
		for (const line of lines) {
			if (currentY > HEIGHT - 250) break;
			ctx.fillText(line, marginX, currentY);
			currentY += lineHeight;
		}

		// === Bottom divider ===
		const bottomSectionY = Math.max(currentY + 30, HEIGHT - 220);
		drawDivider(ctx, WIDTH / 2, bottomSectionY, 200);

		// === Signature ===
		ctx.textAlign = 'center';
		ctx.font = 'italic 500 18px "Cormorant Garamond", Georgia, serif';
		ctx.fillStyle = '#5a3a12';
		ctx.fillText('Отець Клод Дебагович', WIDTH / 2, bottomSectionY + 40);

		ctx.font = '14px "Cormorant Garamond", Georgia, serif';
		ctx.fillStyle = '#7a5a2a';
		const dateStr = new Date().toLocaleDateString('uk-UA', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		ctx.fillText(dateStr, WIDTH / 2, bottomSectionY + 65);

		// === Wax seal ===
		drawWaxSeal(ctx, WIDTH / 2, bottomSectionY + 140, 45);
	}

	function mulberry32(seed: number) {
		let t = seed;
		return () => {
			t = (t + 0x6D2B79F5) | 0;
			let x = Math.imul(t ^ (t >>> 15), 1 | t);
			x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
			return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
		};
	}

	function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
	}

	function drawCornerOrnaments(ctx: CanvasRenderingContext2D) {
		const m = 26;
		const s = 30;
		const corners = [
			{ x: m, y: m, sx: 1, sy: 1 },
			{ x: WIDTH - m, y: m, sx: -1, sy: 1 },
			{ x: m, y: HEIGHT - m, sx: 1, sy: -1 },
			{ x: WIDTH - m, y: HEIGHT - m, sx: -1, sy: -1 }
		];

		ctx.strokeStyle = '#b8952e';
		ctx.lineWidth = 2;

		for (const c of corners) {
			ctx.save();
			ctx.translate(c.x, c.y);
			ctx.scale(c.sx, c.sy);

			// Curved flourish
			ctx.beginPath();
			ctx.moveTo(0, s);
			ctx.quadraticCurveTo(0, 0, s, 0);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(4, s - 6);
			ctx.quadraticCurveTo(4, 4, s - 6, 4);
			ctx.stroke();

			// Diamond
			const dx = 10, dy = 10, ds = 4;
			ctx.fillStyle = '#b8952e';
			ctx.beginPath();
			ctx.moveTo(dx, dy - ds);
			ctx.lineTo(dx + ds, dy);
			ctx.lineTo(dx, dy + ds);
			ctx.lineTo(dx - ds, dy);
			ctx.closePath();
			ctx.fill();

			ctx.restore();
		}
	}

	function drawOrthodoxCross(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
		ctx.save();
		ctx.translate(cx, cy);
		ctx.scale(scale, scale);
		ctx.strokeStyle = '#b8952e';
		ctx.lineWidth = 2.5;
		ctx.lineCap = 'round';

		// Vertical
		ctx.beginPath();
		ctx.moveTo(0, -30);
		ctx.lineTo(0, 35);
		ctx.stroke();

		// Top bar
		ctx.beginPath();
		ctx.moveTo(-10, -18);
		ctx.lineTo(10, -18);
		ctx.stroke();

		// Main bar
		ctx.beginPath();
		ctx.moveTo(-18, -4);
		ctx.lineTo(18, -4);
		ctx.stroke();

		// Slanted bottom bar
		ctx.beginPath();
		ctx.moveTo(-13, 20);
		ctx.lineTo(13, 14);
		ctx.stroke();

		ctx.restore();
	}

	function drawDivider(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number) {
		const halfW = width / 2;
		ctx.strokeStyle = '#b8952e';
		ctx.lineWidth = 1;
		ctx.globalAlpha = 0.6;

		ctx.beginPath();
		ctx.moveTo(cx - halfW, cy);
		ctx.lineTo(cx + halfW, cy);
		ctx.stroke();

		// Center diamond
		const ds = 4;
		ctx.fillStyle = '#b8952e';
		ctx.beginPath();
		ctx.moveTo(cx, cy - ds);
		ctx.lineTo(cx + ds, cy);
		ctx.lineTo(cx, cy + ds);
		ctx.lineTo(cx - ds, cy);
		ctx.closePath();
		ctx.fill();

		// End dots
		for (const dir of [-1, 1]) {
			ctx.beginPath();
			ctx.arc(cx + dir * halfW, cy, 2, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.globalAlpha = 1;
	}

	function drawWaxSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
		// Wavy circle
		ctx.save();
		ctx.beginPath();
		const points = 36;
		for (let i = 0; i <= points; i++) {
			const angle = (i / points) * Math.PI * 2;
			const wobble = radius + Math.sin(angle * 8) * 4 + Math.cos(angle * 5) * 3;
			const x = cx + Math.cos(angle) * wobble;
			const y = cy + Math.sin(angle) * wobble;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();

		// Wax gradient
		const waxGrad = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, radius + 5);
		waxGrad.addColorStop(0, '#d42c2c');
		waxGrad.addColorStop(0.5, '#a01515');
		waxGrad.addColorStop(1, '#6b0e0e');
		ctx.fillStyle = waxGrad;
		ctx.fill();

		// Highlight
		const hlGrad = ctx.createRadialGradient(cx - 12, cy - 12, 0, cx - 12, cy - 12, radius * 0.6);
		hlGrad.addColorStop(0, 'rgba(255,180,180,0.3)');
		hlGrad.addColorStop(1, 'rgba(255,180,180,0)');
		ctx.fillStyle = hlGrad;
		ctx.fill();

		// Cross on seal
		ctx.strokeStyle = 'rgba(255,220,200,0.6)';
		ctx.lineWidth = 2;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.moveTo(cx, cy - 16);
		ctx.lineTo(cx, cy + 16);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(cx - 12, cy - 2);
		ctx.lineTo(cx + 12, cy - 2);
		ctx.stroke();

		ctx.restore();
	}

	function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
		const paragraphs = text.split('\n');
		const lines: string[] = [];

		for (const para of paragraphs) {
			if (para.trim() === '') {
				lines.push('');
				continue;
			}
			const words = para.split(' ');
			let currentLine = '';

			for (const word of words) {
				const testLine = currentLine ? `${currentLine} ${word}` : word;
				const metrics = ctx.measureText(testLine);
				if (metrics.width > maxWidth && currentLine) {
					lines.push(currentLine);
					currentLine = word;
				} else {
					currentLine = testLine;
				}
			}
			if (currentLine) lines.push(currentLine);
		}

		return lines;
	}

	async function downloadPDF() {
		if (!canvasEl || downloading) return;
		downloading = true;
		try {
			const { jsPDF } = await import('jspdf');
			const imgData = canvasEl.toDataURL('image/jpeg', 0.92);
			const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
			const pdfWidth = 190;
			const pdfHeight = pdfWidth * (HEIGHT / WIDTH);
			pdf.addImage(imgData, 'JPEG', 10, 10, pdfWidth, pdfHeight);
			pdf.save('indulgence.pdf');
		} finally {
			downloading = false;
		}
	}

	$effect(() => {
		if (canvasEl && text) {
			document.fonts.ready.then(() => {
				drawCertificate(canvasEl!, text);
			});
		}
	});
</script>

<div class="flex flex-col items-center gap-4">
	<canvas
		bind:this={canvasEl}
		class="max-w-full h-auto rounded-lg shadow-[0_0_30px_rgba(201,168,76,0.15)]"
	></canvas>

	<button
		onclick={downloadPDF}
		disabled={downloading}
		class="font-display flex items-center gap-2 rounded-xl border border-(--gold)/40 px-6 py-3 text-base tracking-widest text-(--gold-light) transition-all hover:border-(--gold)/70 hover:bg-(--gold)/5 disabled:cursor-not-allowed disabled:opacity-30 uppercase bg-transparent cursor-pointer"
	>
		{#if downloading}
			Генерую PDF...
		{:else}
			📄 Завантажити PDF
		{/if}
	</button>
</div>
