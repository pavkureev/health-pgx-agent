# Supabase Architecture

The app should move from browser-only `localStorage` to a user-centric Supabase model.

## Core ownership model

```text
auth.users
  -> patient_profiles
      -> source_documents
      -> lab_observations
      -> genetic_reports
          -> genetic_findings
      -> clinical_signals
```

`patient_profiles` is the center of the domain. A future logged-in user can own one or more profiles: themselves, family members, or test profiles.

`profile_members` makes sharing possible later:

- `owner`: full access and can invite/remove members.
- `editor`: can upload and edit parsed data.
- `viewer`: can read profile data.

## Tables

- `patient_profiles`: human profile metadata, owner, optional birth date/sex.
- `profile_members`: user-to-profile access control.
- `source_documents`: uploaded PDFs, VCF files, manual text, parser diagnostics and extracted text.
- `lab_observations`: normalized lab values such as LDL, CRP, ferritin.
- `genetic_reports`: uploaded genetic data source metadata.
- `genetic_findings`: normalized variants/diplotypes/phenotypes.
- `clinical_signals`: generated risk/recommendation cards shown to physician/patient.

## Storage

Use Supabase Storage for original files instead of putting PDFs/VCFs in database rows.

Suggested bucket:

```text
health-documents
```

Suggested path:

```text
profiles/{profile_id}/documents/{document_id}/{file_name}
```

The database stores only `storage_path`, parser output and normalized values.

## RLS

The migration enables Row Level Security on all profile-owned tables.

Rules:

- A user can read rows only for profiles where they are a member.
- Only `owner` and `editor` can write documents/results/findings.
- Only `owner` can delete a profile.

Use only the Supabase `anon` key in the browser. Never expose the `service_role` key in frontend code.

## Frontend migration plan

1. Keep current `localStorage` profile logic as offline fallback.
2. Add Supabase client configuration:

   ```js
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   ```

3. After login, load `patient_profiles` available to `auth.uid()`.
4. On upload:
   - insert `source_documents`;
   - upload original file to Storage;
   - parse locally in browser for MVP;
   - insert `lab_observations` / `genetic_findings`;
   - generate and insert `clinical_signals`.
5. Later move parsing to server-side Edge Functions for consistent parsing and better privacy controls.

## Auth settings

For email magic links, add the deployed app URL to Supabase Auth redirects:

```text
Authentication -> URL Configuration -> Redirect URLs
```

Suggested values:

```text
https://health.yelchervya.com/pgx/
http://localhost:*/**
file://**
```

Use the local/file redirects only during development.

## Privacy notes

This is health data. Before production use:

- require authentication;
- verify RLS with tests;
- keep audit logs for uploads/deletes;
- avoid storing raw extracted text if not needed;
- encrypt or restrict Storage bucket access;
- document data deletion/export flows.
