# PGx Agent MVP

Статический прототип фармакогенетического помощника.

Откройте `index.html` в браузере. Прототип принимает фрагменты отчета или raw genotype в простых форматах:

```text
CYP2C19 *2/*2
CYP2D6 poor metabolizer
SLCO1B1 rs4149056 TC
HLA-B*58:01 positive
```

Важно: это не медицинское изделие и не сервис назначения лечения. Он показывает справочные pharmacogenomics-сигналы, которые нужно обсуждать с врачом.

## Следующие шаги

- Добавить импорт файлов Генотек и примеры реальных строк отчета.
- Расширить слой лабораторных анализов: PDF/OCR, референсы по полу и возрасту, единицы измерения и нормализацию лабораторий.
- Разнести правила в JSON/SQLite и хранить версию источника.
- Подключить CPIC/PharmGKB/FDA обновления как отдельный curated pipeline.
- Добавить учет анализов крови, функции печени/почек, возраста, беременности, аллергий и текущих лекарственных взаимодействий.

## Деплой

Инструкция и пример nginx-конфига лежат в `deploy/`.

## Supabase

Схема базы данных и описание будущей серверной архитектуры лежат в:

- `supabase/migrations/001_initial_health_schema.sql`
- `supabase/migrations/002_medication_lookup.sql`
- `supabase/functions/lookup-medication/`
- `supabase/functions/sync-shot-list/`
- `docs/supabase-architecture.md`

## GitHub Actions

Workflow `.github/workflows/deploy.yml` запускает тесты, деплоит статику на сервер и обновляет Supabase Edge Functions.

Нужные GitHub Secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

SQL migrations пока не применяются автоматически: их безопаснее запускать вручную в Supabase SQL Editor, пока не согласован процесс миграций.
