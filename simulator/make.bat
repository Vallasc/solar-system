if exist "build" rmdir /Q /S build
mkdir build\app
g++ src/*.cpp -Iinclude -O2 -o build/app/simulator