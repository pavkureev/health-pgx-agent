# Codex Context

Короткий контекст проекта для новых чатов.

## Что это

Статическое приложение PGx/lab assistant, доступное на:

- `https://health.yelchervya.com/pgx/`
- GitHub: `git@github.com:pavkureev/health-pgx-agent.git`

Основная задача: загрузка VCF Genotek, PDF/текста анализов, лекарственного профиля; рекомендации по фармакогенетике, анализам, взаимодействиям и флагам доказательности.

## Главные файлы

- `index.html` — разметка приложения.
- `styles.css` — стили.
- `app.js` — основная клиентская логика.
- `data.js` — справочники PGx, анализов, лекарств и evidence flags.
- `supabase-config.js` — публичная Supabase конфигурация.
- `supabase/functions/lookup-medication/index.ts` — Edge Function для определения действующего вещества и evidence flags.
- `supabase/functions/sync-shot-list/index.ts` — Edge Function для обновления `medication_evidence_flags`.
- `supabase/migrations/` — SQL схема.
- `.github/workflows/deploy.yml` — CI/CD деплой статики и функций.
- `.github/workflows/sync-shot-list.yml` — ручной запуск синхронизации evidence flags.

## Supabase

- Project ref: `alqhlhtrfkxnegjhgccr`
- URL: `https://alqhlhtrfkxnegjhgccr.supabase.co`
- Service-role key не хранить в браузере и не писать в чат.
- SQL migrations пока применяются вручную через SQL Editor.

## Деплой

Обычный путь: push в `main`.

GitHub Actions:

- `Deploy health PGx agent` прогоняет тесты, деплоит статику на сервер и Edge Functions.
- `Sync shot list` запускается вручную и вызывает `sync-shot-list`.

Нужные secrets уже настроены в GitHub:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ANON_KEY`
- `SHOT_LIST_SYNC_SECRET`

## Тесты

```bash
npm test
```

## Важные правила

- Не коммитить `dist/`, архивы, `.temp`, `._*`, `.vscode/`.
- После изменения `index.html`/`app.js`/`data.js`/`styles.css` повышать query string версии скриптов.
- Медицинские рекомендации показывать как справочные сигналы, не как назначение лечения.
- Для новых таблиц Supabase включать RLS.

## Текущие ближайшие задачи

1. `sync-shot-list` parser v2: извлекать 100+ пунктов, а не seed/knownNames.
2. Добавить fixture/test для парсера расстрельного списка.
3. Улучшить UI лекарственного профиля и ручную правку действующего вещества.
4. Расширить drug-drug и drug-lab проверки.
