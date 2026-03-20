# Онлайн Церква — План імплементації

## Context

Створюємо мінімалістичний вебсайт "Онлайн Церква" з двома інтерактивними сторінками: "Поставити свічку" (3D свічка що горить і плавиться) та "Посвятити" (анімація окроплення святою водою + текст благословення). Деплой на GitHub Pages (безкоштовно).

---

## Стек технологій

| Технологія | Пакет | Навіщо |
|---|---|---|
| **SvelteKit** | `@sveltejs/kit` | Фреймворк, роутинг, SSG |
| **Svelte 5** | `svelte` | Рунами ($state, $derived) |
| **Tailwind CSS v4** | `tailwindcss`, `@tailwindcss/vite` | Стилі, мінімалізм |
| **Threlte** | `@threlte/core`, `@threlte/extras` | Svelte-обгортка для Three.js |
| **Three.js** | `three` | 3D рендеринг |
| **adapter-static** | `@sveltejs/adapter-static` | SSG для GitHub Pages |
| **Howler.js** | `howler` | Звуки (свічка, краплі, дзвін) |

---

## Структура проєкту

```
online-church/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Головна (2 кнопки)
│   │   ├── +layout.svelte            # Загальний layout
│   │   ├── candle/
│   │   │   └── +page.svelte          # Сторінка свічки
│   │   └── bless/
│   │       └── +page.svelte          # Сторінка посвячення
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ChurchButton.svelte   # Стилізована кнопка
│   │   │   ├── CandleScene.svelte    # 3D сцена свічки (Threlte)
│   │   │   ├── CandleFlame.svelte    # Полум'я (шейдери/частинки)
│   │   │   ├── CandleWax.svelte      # Віск що тане
│   │   │   ├── BlessScene.svelte     # Сцена окроплення
│   │   │   ├── Aspergillum.svelte    # 3D віничок
│   │   │   ├── WaterDrops.svelte     # Частинки крапель
│   │   │   └── BlessingText.svelte   # Текст благословення
│   │   ├── shaders/
│   │   │   ├── flame.vert            # Vertex шейдер полум'я
│   │   │   ├── flame.frag            # Fragment шейдер полум'я
│   │   │   └── droplet.frag          # Шейдер крапель на екрані
│   │   ├── sounds/
│   │   │   ├── candle-crackle.mp3    # Потріскування свічки
│   │   │   ├── water-splash.mp3      # Окроплення водою
│   │   │   └── church-bell.mp3       # Церковний дзвін
│   │   └── utils/
│   │       └── audio.ts              # Howler.js обгортка
│   ├── app.css                       # Tailwind imports
│   └── app.html                      # HTML шаблон
├── static/
│   ├── .nojekyll                     # Для GitHub Pages
│   └── favicon.ico
├── svelte.config.js
├── vite.config.js
├── tailwind.config.js                # (або CSS-first v4)
└── package.json
```

---

## Покрокова імплементація

### Крок 1: Ініціалізація проєкту
- `npx sv create online-church` (Svelte 5 + SvelteKit)
- Додати Tailwind CSS v4: `npx sv add tailwindcss`
- Встановити залежності:
  ```bash
  npm install three @threlte/core @threlte/extras howler
  npm install -D @sveltejs/adapter-static @types/three
  ```
- Налаштувати `adapter-static` в `svelte.config.js`
- Додати `.nojekyll` в `static/`

### Крок 2: Головна сторінка
- Темний фон, мінімалістичний дизайн
- Хрест або церковний силует (SVG) як лого
- Дві великі кнопки у церковному стилі:
  - "🕯 Поставити свічку" → `/candle`
  - "✝ Посвятити" → `/bless`
- Стиль кнопок: золотисті рамки, шрифт з засічками (serif), тонкі лінії, ефект свічення при hover
- Тихий церковний дзвін при завантаженні (Howler.js, з кнопкою mute)

### Крок 3: Сторінка "Поставити свічку" (`/candle`)
- **3D Сцена (Threlte + Three.js):**
  - Свічка: `CylinderGeometry` з MeshStandardMaterial (воскова текстура)
  - Полум'я: Particle system або billboard з custom шейдерами
    - Vertex шейдер — рух частинок вгору з осциляцією
    - Fragment шейдер — градієнт від жовтого до оранжевого, прозорість
    - Легке мерехтіння (noise-based)
  - Танення воску: анімація деформації верхньої частини свічки (morph targets або процедурна геометрія)
  - Освітлення: PointLight біля полум'я, теплий тон, легке мерехтіння інтенсивності
  - Dim ambient light для фону
- **Звук:** Тихе потріскування свічки (loop, Howler.js)
- **UX:** Кнопка "Назад" та mute

### Крок 4: Сторінка "Посвятити" (`/bless`)
- **Фаза 1 — Анімація окроплення:**
  - 3D або 2D віничок (aspergillum) що з'являється на екрані
  - Анімація "льопання" — віничок рухається і розбризкує краплі
  - Краплі: Canvas 2D частинки або Three.js particles
    - Розлітаються від точки удару
    - Фізика: гравітація, тертя, розмір зменшується
    - На екрані залишаються "мокрі сліди" (fadeout)
  - Ефект дисторсії екрану (post-processing) при попаданні крапель
- **Фаза 2 — Благословення:**
  - Після анімації плавно з'являється текст благословення
  - Варіанти текстів (рандомний вибір):
    - "Нехай Господь благословить тебе і збереже тебе"
    - "Мир тобі і дому твоєму"
    - та інші
  - Текст у церковному стилі (serif font, золотий колір)
  - Кнопка "Ще раз" для повтору анімації
- **Звук:** Звук розбризкування води при окропленні

### Крок 5: Деплой на GitHub Pages
- Налаштувати `svelte.config.js`:
  ```js
  import adapter from '@sveltejs/adapter-static';
  export default {
    kit: {
      adapter: adapter({ fallback: '404.html' }),
      paths: { base: process.argv.includes('dev') ? '' : '/online-church' }
    }
  };
  ```
- Створити GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Push → автоматичний деплой

---

## GitHub Pages — безкоштовність

**Так, GitHub Pages повністю безкоштовний** для публічних репозиторіїв:
- Безкоштовний хостинг статичних сайтів
- HTTPS з коробки
- Custom domain підтримка
- Ліміт: 1GB розмір сайту, 100GB bandwidth/міс

---

## Порядок розробки

1. **Ініціалізація** — проєкт, залежності, конфіг
2. **Головна сторінка** — layout, кнопки, стилі
3. **Свічка** — 3D сцена, полум'я, танення
4. **Посвячення** — віничок, краплі, текст
5. **Звук** — інтеграція Howler.js
6. **Деплой** — GitHub Actions, тестування

---

## Верифікація

- `npm run dev` — локальний запуск, перевірка всіх сторінок
- Перевірити 3D рендеринг свічки: полум'я горить, віск тане
- Перевірити анімацію окроплення: краплі розлітаються, текст з'являється
- Перевірити звук: candle crackle, water splash, church bell
- Перевірити мобільну версію (responsive)
- `npm run build` — збірка для продакшн
- `npm run preview` — перегляд збірки
- Push на GitHub → перевірити GitHub Pages деплой
