# Serveur du jeu (comptes + parties en ligne)

Petit serveur Node.js qui fait le lien entre le jeu et la base MySQL :

- **comptes** : inscription, connexion, profil (routes `/api/...`)
- **parties en ligne** : salons avec code et synchronisation des actions (WebSocket sur `/ws`)

## Lancer en local

1. Importe `database.sql` dans MySQL (DBeaver, phpMyAdmin…).
2. Copie `.env.example` en `.env` et mets ton mot de passe MySQL (`DB_PASSWORD`).
3. Dans ce dossier :

```bash
npm install
npm start
```

Le serveur écoute sur `http://localhost:3001`. Laisse ce terminal ouvert pendant que tu joues.

## Mettre la base de données en ligne (gratuit) avec Aiven

Aiven propose un MySQL gratuit sans carte bancaire (1 CPU, 1 Go de RAM, 1 Go de stockage).
**Attention : le service gratuit s'éteint après une période d'inactivité** ; il faut alors le
rallumer depuis le tableau de bord d'Aiven (tes données sont conservées).

1. Crée un compte sur https://aiven.io, puis un nouveau service **MySQL** avec le plan **Free**.
2. Attends que le service soit « Running », puis note les informations de connexion :
   hôte, port, utilisateur (`avnadmin`), mot de passe, base (`defaultdb`) et le **CA certificate**
   (télécharge-le et enregistre-le dans ce dossier sous le nom `ca.pem`).
3. Dans DBeaver, crée une connexion MySQL avec ces informations (onglet SSL : activer SSL),
   puis exécute **`database-hebergee.sql`** sur la base `defaultdb`.
4. Dans le fichier `.env` de ce dossier, remplace le bloc « sur ton PC » par :

```
PORT=3001
DATABASE_URL=mysql://avnadmin:TON_MOT_DE_PASSE@TON_HOTE:TON_PORT/defaultdb
DB_SSL=true
DB_SSL_CA=ca.pem
```

5. Relance `npm start` : le serveur doit afficher « API des comptes prête ».

Les noms exacts des boutons du site d'Aiven peuvent changer ; le principe reste le même.

> Le **serveur Node** (ce dossier) doit lui aussi tourner quelque part pour que des joueurs
> éloignés puissent jouer ensemble. Pour tester à deux sur le même ordinateur, `npm start`
> en local suffit.
