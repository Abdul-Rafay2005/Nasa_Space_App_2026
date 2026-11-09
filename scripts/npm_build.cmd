@echo off
set "PATH=%~dp0..\.tools\node;%PATH%"
cd /d "%~dp0.."
call "%~dp0..\.tools\node\npm.cmd" run build

