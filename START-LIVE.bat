@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install the LTS version from https://nodejs.org/
  pause
  exit /b 1
)

echo SakuraTH GeoIP2Route - LIVE IP2Location mode
echo Your key is saved only in .env.local on this computer.
set /p "SAKURA_API_KEY=Paste your IP2Location.io API key: "
if not defined SAKURA_API_KEY (
  echo No API key was entered.
  pause
  exit /b 1
)

node scripts/save-live-key.mjs
if errorlevel 1 (
  pause
  exit /b 1
)
set "SAKURA_API_KEY="
set "VITE_DEMO_MODE=false"

if not exist node_modules (
  echo Installing dependencies...
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)

echo.
echo Opening http://localhost:5173
start "" "http://localhost:5173"
call npm run dev
