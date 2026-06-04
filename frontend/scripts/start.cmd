@echo off
setlocal

set "ROOT_DIR=%~dp0..\.."
set "DRIVE=R:"

subst %DRIVE% "%ROOT_DIR%" >nul 2>nul

pushd %DRIVE%\frontend
node scripts\dev.js
set EXIT_CODE=%ERRORLEVEL%
popd

exit /b %EXIT_CODE%
