@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo [Aegis Health] Running physiological verification test suite...
call "%~dp0.tools\node\node.exe" scripts\test_engine.mjs
