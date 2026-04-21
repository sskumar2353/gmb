param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$AdminUsername = "admin",
    [string]$AdminPassword = "admin@123",
    [string]$DbUsername = "root",
    [string]$DbPassword = "pass123",
    [string]$DbHost = "localhost:3306",
    [string]$DbName = "greenmilesbooking",
    [switch]$SkipDbEnv
)

$ErrorActionPreference = "Stop"

if (-not $SkipDbEnv) {
    $env:DB_USERNAME = $DbUsername
    $env:DB_PASSWORD = $DbPassword
    $env:DB_URL = "jdbc:mysql://$DbHost/$DbName?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
    Write-Host "DB env configured for this session." -ForegroundColor Yellow
}

& "./backend/scripts/verify-admin-smoke.ps1" `
    -BaseUrl $BaseUrl `
    -AdminUsername $AdminUsername `
    -AdminPassword $AdminPassword
