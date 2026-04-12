@echo off
REM ============================================================
REM  Lona Library – build.bat
REM  Compiles all CGI C programs using GCC (MinGW / TDM-GCC)
REM  Output:  cgi-bin\*.exe  (Apache/XAMPP CGI directory)
REM ============================================================

SET SRC=cgi-bin\backend_source
SET OUT=cgi-bin

echo [1/5] Compiling login.c ...
gcc -O2 -o %OUT%\login.exe     %SRC%\login.c
if %ERRORLEVEL% NEQ 0 ( echo ERROR compiling login.c & pause & exit /b )

echo [2/5] Compiling books.c ...
gcc -O2 -o %OUT%\books.exe     %SRC%\books.c
if %ERRORLEVEL% NEQ 0 ( echo ERROR compiling books.c & pause & exit /b )

echo [3/5] Compiling view_books.c ...
gcc -O2 -o %OUT%\view_books.exe %SRC%\view_books.c
if %ERRORLEVEL% NEQ 0 ( echo ERROR compiling view_books.c & pause & exit /b )

echo [4/5] Compiling issue_book.c ...
gcc -O2 -o %OUT%\issue_book.exe %SRC%\issue_book.c
if %ERRORLEVEL% NEQ 0 ( echo ERROR compiling issue_book.c & pause & exit /b )

echo [5/5] Compiling return_book.c ...
gcc -O2 -o %OUT%\return_book.exe %SRC%\return_book.c
if %ERRORLEVEL% NEQ 0 ( echo ERROR compiling return_book.c & pause & exit /b )

echo.
echo === Build successful! ===
echo.
echo XAMPP setup reminder:
echo  1. Copy cgi-bin\*.exe  →  C:\xampp\cgi-bin\
echo  2. Copy cgi-bin\data\* →  C:\xampp\cgi-bin\data\
echo  3. Copy htdocs\*       →  C:\xampp\htdocs\lona_library\
echo  4. Start Apache in XAMPP and open:
echo     http://localhost/lona_library/
echo.
pause
