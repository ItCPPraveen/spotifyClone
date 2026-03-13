@echo off
REM Spotify Clone Setup Script for Windows

setlocal enabledelayedexpansion

echo.
echo 🎵 Spotify Clone - Setup Script
echo ================================
echo.

REM Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
  echo ✗ Node.js not found. Please install Node.js 18+
  exit /b 1
)
echo ✓ Node.js is installed

REM Check npm
npm -v >nul 2>&1
if %errorlevel% neq 0 (
  echo ✗ npm not found
  exit /b 1
)
echo ✓ npm is installed

REM Setup Backend
echo.
echo Setting up Backend...
cd backend

if not exist ".env" (
  copy .env.example .env
  echo ✓ Created .env from template
  echo ⚠️  Please update backend\.env with your credentials
) else (
  echo ✓ .env file exists
)

if not exist "node_modules" (
  echo Installing backend dependencies...
  call npm install
  echo ✓ Backend dependencies installed
) else (
  echo ✓ Backend dependencies already installed
)

cd ..

REM Setup Frontend
echo.
echo Setting up Frontend...
cd frontend

if not exist "node_modules" (
  echo Installing frontend dependencies...
  call npm install
  echo ✓ Frontend dependencies installed
) else (
  echo ✓ Frontend dependencies already installed
)

cd ..

REM Print instructions
echo.
echo ✓ Setup complete!
echo.
echo To start the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   npm run start:dev
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm start
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:4200
