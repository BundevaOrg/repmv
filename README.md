# repmv

Сайт репетитора по математике Маргариты Владимировны — https://repmv.ru

Статический одностраничник (GitHub Pages, без сборки): `index.html`, `assets/css/style.css`, `assets/js/main.js`.
Шрифты Golos Text и Source Serif 4 (лицензия OFL) лежат локально в `assets/fonts/`.

## Что заменить перед запуском

Все места помечены в `index.html` комментариями `ЗАГЛУШКА` / `TODO` / `ШАБЛОН`.

| Что | Где | Формат |
|---|---|---|
| Изображение героя | `.hero__media` | `assets/img/hero-3x2.jpg` (≥ 2400×1600) и `hero-4x5.jpg` для мобильных; готовый `<picture>` — в комментарии |
| Фото «Обо мне» | `.about__photo` | `assets/img/portrait.jpg`, 4:5, от 1200×1500 |
| Отзывы | `.reviews` | Скриншот переписки (обезличенный) в `assets/img/reviews/`, путь — в `data-src` кнопки; бейдж, цитата и подпись — в карточке |
| Контакты | `#contacts` | Telegram, WhatsApp (номер в `wa.me/7…`), MAX, телефон |
| Статус и ИНН | `.site-footer__legal` | — |
| og:image | `<head>` | 1200×630 |
