@echo off
echo ========================================================
echo    PROMETHEUS // F.O.G.O. - INICIANDO SISTEMA INTEGRADO
echo ========================================================
echo.

echo [1/2] Iniciando Servidor Backend (Node.js + SQLite na porta 3001)...
start "F.O.G.O. - Servidor Backend" cmd /k "cd server && node index.js"

timeout /t 2 /nobreak > nul

echo [2/2] Iniciando Painel Web Frontend (Vite + React na porta 5173)...
start "F.O.G.O. - Frontend Web" cmd /k "cd client && npm run dev"

echo.
echo Tudo pronto! O sistema esta rodando em:
echo -> Painel Web: http://localhost:5173
echo -> API Backend: http://localhost:3001/api/equipments
echo.
pause
