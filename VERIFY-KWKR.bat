@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 22.x is nodig.
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

if not exist .env.local copy /Y .env.example .env.local >nul

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
  if errorlevel 1 goto :fail
)

echo.
echo KWKR volledige kwaliteitscontrole starten...
echo.
call npm run verify
if errorlevel 1 goto :fail

echo.
echo ==============================================
echo KWKR VERIFY: ALLE CONTROLES GROEN
echo ==============================================
pause
exit /b 0

:fail
echo.
echo ==============================================
echo KWKR VERIFY: ER IS EEN FOUT GEVONDEN
echo ==============================================
echo Kopieer de foutmelding uit dit venster en stuur ze door.
pause
exit /b 1
