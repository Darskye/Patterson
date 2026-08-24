@echo off
REM VAN OPS - serve the wall over http:// so the monitors can talk to each other.
cd /d "%~dp0"
set PORT=%1
if "%PORT%"=="" set PORT=8080
echo.
echo   VAN OPS is up.  Open this on every monitor:
echo.
echo       http://localhost:%PORT%/
echo.
echo   Ctrl-C to stop.
echo.
where python >nul 2>nul && (python -m http.server %PORT% & goto :eof)
where py     >nul 2>nul && (py -m http.server %PORT% & goto :eof)
where npx    >nul 2>nul && (npx --yes serve -l %PORT% . & goto :eof)
echo Need Python or Node installed.
pause
