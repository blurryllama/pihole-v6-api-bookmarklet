@echo off
echo Searching for Chrome installations...
echo.

set FOUND=0

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo Found Chrome at: "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
    set FOUND=1
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo Found Chrome at: "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
    set FOUND=1
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    echo Found Chrome at: "%LocalAppData%\Google\Chrome\Application\chrome.exe"
    set FOUND=1
)

if %FOUND%==0 (
    echo Chrome not found in standard locations.
    echo.
    echo Searching for chrome.exe in Program Files directories...
    echo.
    dir /s /b "%ProgramFiles%\chrome.exe" 2>nul
    dir /s /b "%ProgramFiles(x86)%\chrome.exe" 2>nul
    
    echo.
    echo Searching for chrome.exe in AppData...
    echo.
    dir /s /b "%LocalAppData%\chrome.exe" 2>nul
)

echo.
echo If you found your Chrome path, update the runtimeExecutable in .vscode/launch.json
echo.
pause 