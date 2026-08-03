# Security Policy

## Supported Versions

This project is currently maintained on the latest `main` branch.

## Reporting a Vulnerability

Please do not open public issues for sensitive security reports.

Contact the maintainers privately with:

- A short description of the issue
- Reproduction steps
- Potential impact
- Suggested mitigation (if available)

## Secret Handling

- Never commit `.env.local`.
- Never commit Firebase service-account JSON files.
- Keep `.env.example` placeholder-only.
- Rotate keys immediately if they are exposed.

## Recommended Pre-Push Checks

```bash
npm run lint
npm run build
```

If you changed Firestore rules or indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```
