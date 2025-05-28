@echo off
SETLOCAL

REM === Set your Docker Hub username and image name ===
set DOCKER_USERNAME=vasilikovalski
set IMAGE_NAME=nostromo-server-js
set TAG=latest-9

echo Building Docker image...
docker build -t %DOCKER_USERNAME%/%IMAGE_NAME%:%TAG% .

if %errorlevel% neq 0 (
    echo Failed to build the Docker image.
    exit /b %errorlevel%
)

echo Pushing Docker image to Docker Hub...
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:%TAG%

if %errorlevel% neq 0 (
    echo Failed to push the Docker image.
    exit /b %errorlevel%
)

echo Successfully pushed %DOCKER_USERNAME%/%IMAGE_NAME%:%TAG% to Docker Hub!


pause