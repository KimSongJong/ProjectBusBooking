@echo off
echo ========================================
echo   Starting Frontend (React + Vite)
echo ========================================
echo.

echo [1/3] Navigating to frontend directory...
cd /d "%~dp0frontend-react"

echo [2/3] Checking if node_modules exists...
if not exist "node_modules\" (
    echo [WARNING] node_modules not found! Installing dependencies...
    pnpm install
)

echo.
echo [3/3] Starting Vite development server...
echo Frontend will be available at: http://localhost:5173
echo.
pnpm dev

