@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 22.x is nodig.
  echo Installeer Node.js 22 LTS en start dit bestand daarna opnieuw.
  pause
  exit /b 1
)

for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set NODE_MAJOR=%%v
if not "%NODE_MAJOR%"=="22" (
  echo Deze release gebruikt exact Node.js major 22.x.
  echo Huidige versie:
  node --version
  pause
  exit /b 1
)

if not exist .env.local (
  copy /Y .env.example .env.local >nul
  echo Lokale instellingen aangemaakt.
)

set NEED_INSTALL=0
if not exist node_modules set NEED_INSTALL=1
if exist node_modules\typescript\package.json (
  for /f "delims=" %%v in ('node -p "require('./node_modules/typescript/package.json').version"') do set TS_VERSION=%%v
  if not "!TS_VERSION!"=="6.0.3" set NEED_INSTALL=1
) else (
  set NEED_INSTALL=1
)

if "!NEED_INSTALL!"=="1" (
  echo Packages installeren voor de vaste KWKR toolchain...
  if exist package-lock.json (
    call npm ci
  ) else (
    call npm install
  )
  if errorlevel 1 (
    echo Installatie mislukt. Controleer je internetverbinding en probeer opnieuw.
    pause
    exit /b 1
  )
)

start "" powershell -NoProfile -WindowStyle Hidden -Command "$u='http://localhost:3000'; for($i=0;$i -lt 90;$i++){try{$r=Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 2;if($r.StatusCode -ge 200){Start-Process $u;exit}}catch{};Start-Sleep -Seconds 1};Start-Process $u"
call npm run dev
pause
