@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo [Aegis Health] Pushing all commits to https://github.com/Abdul-Rafay2005/Nasa_Space_App_2026 ...
git push -u origin main
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Code pushed to GitHub successfully!
) else (
    echo [ERROR] Git push encountered an issue. Check your GitHub authentication or network.
)
pause
