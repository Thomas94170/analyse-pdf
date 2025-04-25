<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->



📁 Upload et traitement OCR

Endpoint POST /documents avec :
Upload d’un fichier PDF avec Multer.
Conversion PDF → image avec pdftocairo.
Extraction de texte via Tesseract.js.
Normalisation du texte pour détecter les doublons.
Détection automatique du type de document (FACTURE / CERFA / AUTRE).
Extraction de métadonnées clés :
SIRET
Total HT
Total TTC
Date d’échéance ou date de paiement
Insertion complète en base de données avec Prisma et champ metadata (type JSONB).
🔍 Fonctionnalités avancées déjà présentes

Endpoint GET /documents/search?q=mot pour rechercher un mot dans le texte OCR extrait (ILIKE sur textExtracted).
Endpoint GET /documents pour lister tous les documents.
Endpoint GET /documents/id/:id pour afficher un document par son ID.
Système de détection automatique des doublons à l'upload.
Logique d’analyse de texte robuste avec regex adaptées au contexte de facture/CERFA.
💰 Début du module CA

Ajout du modèle Income en base.
Endpoint GET prêt à calculer le chiffre d'affaires annuel à partir des montants TTC contenus dans les métadonnées (pas encore déclenché automatiquement).
