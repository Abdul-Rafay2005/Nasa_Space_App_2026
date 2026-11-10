@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo [Aegis Health] Starting Vite development server on http://localhost:3000 ...
call "%~dp0.tools\node\npm.cmd" run dev
