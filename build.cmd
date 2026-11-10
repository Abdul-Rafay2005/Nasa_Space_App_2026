@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo [Aegis Health] Building TypeScript + Vite production bundle...
call "%~dp0.tools\node\npm.cmd" run build

