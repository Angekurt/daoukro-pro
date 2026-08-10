#!/bin/bash
# Déploiement de la PWA daoukro-pro sur LWS cPanel.
# À lancer depuis le Terminal cPanel, dans le dossier du projet :
#   cd /home/c2613905c/public_html/daoukro-pro
#   bash scripts/deploy.sh
#
# Pré-requis serveur :
#   - Node.js disponible (vérifier avec : node -v)
#   - npm disponible  (vérifier avec : npm -v)
#   - Le repo GitHub est déjà cloné dans ce dossier
#   - Le fichier .env est déjà présent (non versionné)
#
# Si Node.js n'est pas disponible sur votre hébergement LWS mutualisé :
#   → Construire le dist/ en local puis transférer uniquement le dist/ par FTP/rsync
#   → Voir section "Alternative sans Node.js" ci-dessous.

set -e

echo "== 1. Récupération du code =="
git pull origin main

echo "== 2. Dépendances npm =="
npm ci --prefer-offline

echo "== 3. Build production =="
npm run build
# Génère le dossier dist/ avec tous les assets optimisés

echo "== 4. Permissions dist/ =="
chmod -R 755 dist/

echo "== Terminé. La PWA est à jour. =="

# ─────────────────────────────────────────────────────────────────────────────
# ALTERNATIVE SANS NODE.JS SUR LE SERVEUR
# ─────────────────────────────────────────────────────────────────────────────
# Si LWS mutualisé ne propose pas Node.js en ligne de commande :
#
# 1. En local : npm run build  (génère dist/)
# 2. git add dist/ -f && git commit -m "dist: build prod" && git push
#    (ou ajouter une exception dans .gitignore pour dist/)
# 3. Sur le serveur : git pull origin main  (dist/ est déjà prêt)
# 4. Aucun npm run build nécessaire côté serveur.
#
# C'est l'approche recommandée pour LWS mutualisé (pas de Node.js CLI).
