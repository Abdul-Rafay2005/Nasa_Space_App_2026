@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo [Aegis Health] Starting production preview server...
call "%~dp0.tools\node\npm.cmd" run preview

