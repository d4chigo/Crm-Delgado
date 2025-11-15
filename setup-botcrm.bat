@echo off
REM Script para compilar y preparar el botcrm en Windows
REM Uso: setup-botcrm.bat

setlocal enabledelayedexpansion

echo.
echo 🤖 Compilando BotCRM...
echo.

REM Cambiar a directorio botcrm
cd botcrm

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependencias del botcrm...
    call npm install
)

REM Compilar botcrm
echo 🔨 Compilando botcrm...
call npm run build

REM Crear directorio de destino si no existe
if not exist "..\client\public\botcrm" (
    mkdir ..\client\public\botcrm
)

REM Copiar archivos compilados
echo 📁 Copiando archivos compilados...
xcopy /E /I /Y dist ..\client\public\botcrm

echo.
echo ✅ BotCRM compilado y copiado exitosamente!
echo.
echo 📍 Archivos compilados en: client\public\botcrm\
echo.
echo 🚀 Ahora puedes ejecutar: make dev
echo.

endlocal
