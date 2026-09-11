@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install the LTS version from https://nodejs.org/
  pause
  exit /b 1
)

rem Keep any existing live API key file intact.
set "VITE_DEMO_MODE=true"

if not exist node_modules (
  echo Installing dependencies...
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)

echo Opening http://localhost:5173 in demo mode
start "" "http://localhost:5173"
call npm run dev
