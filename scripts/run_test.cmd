@echo off
set "PATH=%~dp0..\.tools\node;%PATH%"
cd /d "%~dp0.."
call "%~dp0..\.tools\node\node.exe" --loader "%~dp0..\node_modules\ts-node\esm.mjs" scripts\test_engine.ts 2>nul || call "%~dp0..\.tools\node\npx.cmd" tsx scripts\test_engine.ts
