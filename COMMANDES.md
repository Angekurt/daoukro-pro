# Commandes de déploiement — Daoukro Pro PWA

## Mettre à jour le PWA sur le serveur

### 1. Sur ton PC (PowerShell)
```powershell
cd C:\projet\daoukro-pro
npm run build
git add -A
git commit -m "description du changement"
git push origin main
```

### 2. Sur le serveur (terminal SSH cPanel)
```bash
cd ~/public_html/daoukro-pro && git pull origin main
```

---

## Accès aux plateformes

| Plateforme   | URL                                     |
|--------------|-----------------------------------------|
| PWA          | https://daoukro-pro.akdev.tech          |
| Admin        | https://api-daoukro.akdev.tech/admin    |
| Landing page | https://daoukro.akdev.tech              |
