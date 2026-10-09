@echo off
SETLOCAL

REM Try to find node in standard path if not in PATH
IF EXIST "C:\Program Files\nodejs\node.exe" (
    SET "PATH=%PATH%;C:\Program Files\nodejs"
)

echo Starting Innovation Website...
echo Ensure you have run: npm install (if not done automatically)
echo.

IF EXIST "node_modules" (
    call npm run dev
) ELSE (
    echo Installing dependencies first...
    call npm install
    call npm run dev
)

pause
