# SpeakUp

SpeakUp est une application mobile d'apprentissage quotidien de l'anglais. Le MVP utilise React Native avec Expo SDK 57 pour le mobile et NestJS, Prisma et PostgreSQL pour l'API.

## Fonctionnalites du MVP

- inscription, connexion, session securisee et suppression du compte ;
- onboarding et test de niveau A1 a B2+ ;
- cinq lecons jouables avec progression, score et deblocage ;
- tableau de bord, XP, serie quotidienne et statistiques ;
- cinq scenarios de conversation avec lecture vocale ;
- profil, objectif quotidien, sons, vibrations et rappel local a 19 h ;
- fonctionnement local-first lorsque l'API n'est pas joignable.

## Prerequis

- Node.js 22 et npm ;
- Docker Desktop ;
- Expo Go sur un telephone connecte au meme Wi-Fi que le PC.

## Lancement complet en local

### 1. API et base de donnees

```powershell
cd backend
npm install
npm run db:start
npm run prisma:migrate:deploy
npm run prisma:generate
npm run start:dev
```

L'API repond sur `http://localhost:3000/api/health`. Pour un telephone physique, elle doit aussi repondre sur `http://ADRESSE_IP_DU_PC:3000/api/health`.

### 2. Application mobile

Dans un second terminal, a la racine du projet :

```powershell
npm install
npm start -- --lan
```

Configurer `.env.local` avec l'adresse IPv4 du PC, par exemple :

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:3000/api
```

Scanner ensuite le QR code avec Expo Go. Ne pas utiliser `localhost` depuis un telephone physique.

## Verification

```powershell
npm run validate
npx expo-doctor
cd backend
npm run build
npm run lint
npm test
npm run test:e2e
```

## Build Android de test

Le profil `preview` produit un APK installable :

```powershell
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Le build de production utilise le profil `production`. L'URL API de production devra etre configuree dans EAS avant publication.
