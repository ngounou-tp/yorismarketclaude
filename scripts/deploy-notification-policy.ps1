# Déploie commit Git + migration Supabase (politique email notifications)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/deploy-notification-policy.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> Git push origin main" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { throw "git push a echoue" }

Write-Host ""
Write-Host "==> Migration SQL" -ForegroundColor Cyan
Write-Host "Ouvrez Supabase Dashboard > SQL Editor > New query"
Write-Host "Collez le fichier: supabase/migrations/20260528000100_notification_email_policy.sql"
Write-Host "Puis Run."
Write-Host ""
Write-Host "Ou via MCP/Cursor: apply_migration notification_email_policy"
Write-Host ""

Write-Host "==> Edge Functions a redeployer (Dashboard > Edge Functions)" -ForegroundColor Cyan
Write-Host "  - dispatch_notification (index.ts + _shared/cors.ts + _shared/notification_channels.ts)"
Write-Host "  - stock_lifecycle (si deja deployee sur le projet)"
Write-Host ""
Write-Host "verify_jwt: false pour dispatch_notification (auth par secret/service role)"
Write-Host ""
Write-Host "Termine. Test: publier un produit -> notif admin in-app, pas d'email Resend." -ForegroundColor Green
