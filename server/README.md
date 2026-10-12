# Serveur des comptes joueurs

Petit serveur Node.js qui fait le lien entre le jeu et la base MySQL (`database.sql`).

## Lancer

1. Importe `database.sql` dans MySQL (DBeaver, phpMyAdmin…).
2. Copie `.env.example` en `.env` et mets ton mot de passe MySQL (`DB_PASSWORD`).
3. Dans ce dossier :

```bash
npm install
npm start
```

Le serveur écoute sur `http://localhost:3001`. Laisse ce terminal ouvert pendant que tu joues.
