# Commandes utiles — Daoukro Pro PWA

## Mettre à jour le PWA sur le serveur

Après chaque modification en local, faire dans cet ordre :

### 1. Sur ton PC (PowerShell dans VS Code)
```powershell
cd C:\projet\daoukro-pro
npm run build
git add -A
git commit -m "description du changement"
git push origin main
```

### 2. Sur le serveur cPanel (terminal SSH)
```bash
cd /home/c2613905c/public_html/daoukro-pro && git pull origin main
```

---

## Accès aux plateformes

| Plateforme       | URL                                        |
|------------------|--------------------------------------------|
| PWA              | https://daoukro-pro.akdev.tech             |
| API / Admin      | https://api-daoukro.akdev.tech/admin       |
| Landing page     | https://daoukro.akdev.tech                 |
| GitHub repo PWA  | https://github.com/Angekurt/daoukro-pro    |

---

## Mettre à jour l'API Laravel sur le serveur

```bash
cd /home/c2613905c/public_html/api-daoukro && git pull origin main
```

---

## Vérifier que tout fonctionne (API)

```bash
cd /home/c2613905c/public_html/api-daoukro
/opt/alt/php83/usr/bin/php artisan route:list | grep api
```

---

## Contact & Support
- Email : ange@akdev.tech
- WhatsApp : +225 07 98 24 05 15
