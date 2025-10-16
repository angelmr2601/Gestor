@echo off
cd /d "D:\Gestor"
start "" "http://localhost:9002"
powershell -ExecutionPolicy Bypass -NoExit -Command "npm run dev"