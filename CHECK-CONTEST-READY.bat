@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title SakuraTH GeoIP2Route - Contest Readiness Check

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js 20.19+ or 22.12+ is required.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing locked dependencies...
  call npm ci
  if errorlevel 1 goto failed
)

echo.
echo [1/2] Running automated checks...
call npm run check
if errorlevel 1 goto failed

echo.
echo [2/2] Building the production app...
call npm run build
if errorlevel 1 goto failed

echo.
echo ============================================
echo Automated contest checks passed.
echo ============================================
echo Manual checks still required:
echo - Test a real IP2Location key locally and online.
echo - Verify Netlify rate-limit rules in the deploy log.
echo - Check desktop/mobile, EN/TH and light/dark layouts.
echo - Verify the public repository and unsigned-in live demo.
echo - Capture current screenshots/GIF and test the submission links.
echo.
pause
exit /b 0

:failed
echo.
echo ============================================
echo Contest readiness check FAILED.
echo Fix the error above before submitting.
echo ============================================
pause
exit /b 1
