@echo off
chcp 65001 >nul
title ROMAN - Chia se website qua Internet
cd /d "%~dp0"
echo.
echo  ROMAN - Mo website tren may nay ra Internet de nguoi khac xem thu
echo  ================================================================
echo.

where node >nul 2>nul || (echo  [LOI] Chua cai Node.js. & pause & exit /b 1)
set "CF=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not exist "%CF%" set "CF=%ProgramFiles%\cloudflared\cloudflared.exe"
if not exist "%CF%" (where cloudflared >nul 2>nul && set "CF=cloudflared")
if not exist "%CF%" if not "%CF%"=="cloudflared" (echo  [LOI] Chua cai cloudflared. Cai bang lenh: winget install Cloudflare.cloudflared & pause & exit /b 1)

rem Neu may chu website chua chay thi khoi dong (TRUST_PROXY=1: nhan dung IP khach qua duong ham)
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if errorlevel 1 (
  echo  Dang khoi dong may chu website...
  start "ROMAN - May chu website" /min cmd /c "set TRUST_PROXY=1&& node server\index.js"
  timeout /t 3 /nobreak >nul
)

echo  Dang tao duong link... Link co dang https://....trycloudflare.com
echo  - Gui link do cho nguoi can xem. Trang quan tri: them /admin/ vao cuoi link.
echo  - Link chi hoat dong khi cua so nay con mo va may tinh khong tat / ngu.
echo  - Moi lan mo lai se ra link MOI. Dong cua so nay de ngung chia se.
echo.
"%CF%" tunnel --no-autoupdate --url http://127.0.0.1:5173
pause
