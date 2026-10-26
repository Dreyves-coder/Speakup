# SpeakUp API

API REST NestJS avec PostgreSQL et Prisma.

## Demarrage local

```powershell
npm install
npm run db:start
npm run prisma:migrate:deploy
npm run prisma:generate
npm run start:dev
```

Le controle de sante est disponible sur `GET http://localhost:3000/api/health`.

## Routes principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `DELETE /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/lessons`
- `POST /api/lessons/:id/complete`
- `GET /api/progress`

Toutes les routes hors inscription, connexion et sante exigent un JWT dans l'en-tete `Authorization: Bearer ...`.

## Tests

```powershell
npm run build
npm run lint
npm test
npm run test:e2e
```

Les tests E2E necessitent PostgreSQL (`npm run db:start`).

## Conteneur de production

Construire l'image depuis ce dossier :

```powershell
docker build -t speakup-api .
```

Au lancement, fournir `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` et eventuellement `PORT`. Le conteneur applique automatiquement les migrations avant de demarrer l'API.
