# Frontend - Parcours DevOps Guide

Interface web (Next.js + TypeScript) du MicroSaaS documenté dans `../docs/`.

## Démarrage local

```bash
cp .env.example .env.local
npm install
npm run dev
```

L'application est servie sur [http://localhost:3000](http://localhost:3000) et appelle l'API backend via `NEXT_PUBLIC_API_URL`.
