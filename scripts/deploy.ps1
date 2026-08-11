# deploy.ps1 — Déploie le dist vers le serveur cPanel via SCP
# Usage : .\scripts\deploy.ps1

$SSH_USER   = "c2613905c"
$SSH_HOST   = "web60.srv.net"   # <-- remplace par ton vrai host SSH cPanel
$SSH_PORT   = "21098"            # <-- port SSH cPanel (souvent 21098)
$REMOTE_DIR = "/home/c2613905c/public_html/daoukro-pro"
$LOCAL_DIR  = "$PSScriptRoot\..\dist\"

Write-Host "Build en cours..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\.."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build echoue !" -ForegroundColor Red
    exit 1
}

Write-Host "Deploiement vers $SSH_HOST..." -ForegroundColor Cyan
scp -P $SSH_PORT -r "$LOCAL_DIR*" "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deploiement reussi !" -ForegroundColor Green
    Write-Host "Site : https://daoukro-pro.akdev.tech" -ForegroundColor Green
} else {
    Write-Host "Echec du deploiement" -ForegroundColor Red
}
