# Инструкция по деплою

## Firebase Hosting

1. Установите Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Войдите в Firebase:
```bash
firebase login
```

3. Инициализируйте проект (если ещё не инициализирован):
```bash
firebase init hosting
```

4. Соберите проект:
```bash
npm run build
```

5. Задеплойте:
```bash
firebase deploy --only hosting
```

## Vercel

1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Задеплойте:
```bash
vercel
```

Или через веб-интерфейс: подключите репозиторий на https://vercel.com

## Netlify

1. Установите Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Соберите проект:
```bash
npm run build
```

3. Задеплойте:
```bash
netlify deploy --prod --dir=dist
```

## Yandex Object Storage

1. Соберите проект:
```bash
npm run build
```

2. Загрузите содержимое папки `dist/` в бакет Yandex Object Storage

3. Настройте статический хостинг для бакета

## GitHub Pages

1. Установите `gh-pages`:
```bash
npm install --save-dev gh-pages
```

2. Добавьте в `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. Задеплойте:
```bash
npm run deploy
```

---

После деплоя приложение будет доступно по предоставленному URL.

