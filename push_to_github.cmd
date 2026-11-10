@echo off
set "PATH=%~dp0.tools\node;%PATH%"
echo [Aegis Health] Syncing with https://github.com/Abdul-Rafay2005/Nasa_Space_App_2026 ...

:: Check if user wants to force push or pull & merge
echo.
echo Choose an option:
echo   [1] Pull remote changes and merge (Recommended if remote has files you want to keep)
echo   [2] Force push (Overwrites remote with this complete Phase 1 codebase)
echo.
set /p choice="Enter choice [1 or 2]: "

if "%choice%"=="2" (
    echo [Aegis Health] Force pushing to origin main...
    git push -u origin main --force
) else (
    echo [Aegis Health] Pulling remote with unrelated histories allowed...
    git pull origin main --allow-unrelated-histories --no-rebase -m "Merge remote repository initialization"
    echo [Aegis Health] Pushing merged codebase to origin main...
    git push -u origin main
)

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] Code pushed to GitHub successfully!
    echo Check: https://github.com/Abdul-Rafay2005/Nasa_Space_App_2026
    echo ========================================================
) else (
    echo.
    echo [ERROR] Git push encountered an issue.
)
pause
