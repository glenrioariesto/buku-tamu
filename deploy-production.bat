@echo off
setlocal EnableDelayedExpansion

echo.
echo ==========================================
echo   DEPLOY: development ^-^> master (production)
echo ==========================================
echo.

:: 1. Pastikan di branch development
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "!CURRENT_BRANCH!"=="development" (
  echo [ERROR] Harus berada di branch 'development'. Branch saat ini: !CURRENT_BRANCH!
  exit /b 1
)

:: 2. Pastikan tidak ada uncommitted changes
git diff --quiet --exit-code 2>nul
if errorlevel 1 (
  echo [ERROR] Ada perubahan yang belum di-commit. Jalankan 'git add' dan 'git commit' terlebih dahulu.
  exit /b 1
)

git diff --cached --quiet --exit-code 2>nul
if errorlevel 1 (
  echo [ERROR] Ada perubahan yang sudah di-stage tapi belum di-commit.
  exit /b 1
)

echo [1/4] TypeScript check...
call npx tsc --noEmit
if errorlevel 1 (
  echo [ERROR] TypeScript check gagal. Perbaiki error sebelum deploy.
  exit /b 1
)
echo       OK

echo [2/4] Build production...
call npm run build
if errorlevel 1 (
  echo [ERROR] Build gagal. Perbaiki error sebelum deploy.
  exit /b 1
)
echo       OK

echo [3/4] Merge ke master...
git checkout master
if errorlevel 1 ( echo [ERROR] Gagal checkout master. & exit /b 1 )

git merge development --no-ff -m "chore: merge development into master"
if errorlevel 1 (
  echo [ERROR] Merge conflict. Selesaikan conflict lalu push manual.
  git checkout development
  exit /b 1
)

:: Hapus file development-only dari master setelah merge
if exist src\test (
  git rm -r --cached src/test/ >nul 2>&1
  git rm --cached jest.config.ts >nul 2>&1
  git rm --cached deploy-production.bat >nul 2>&1
  git rm --cached scripts/migrate-turso.mjs >nul 2>&1
  git rm -r --cached drizzle/ >nul 2>&1
  git commit -m "chore: remove dev-only files from production" >nul 2>&1
)
echo       OK

echo [4/4] Push ke origin master...
git push origin master
if errorlevel 1 (
  echo [ERROR] Push gagal.
  exit /b 1
)
echo       OK

:: Kembali ke development
git checkout development

echo.
echo ==========================================
echo   SUKSES! Netlify akan auto-deploy sekarang.
echo ==========================================
echo.
