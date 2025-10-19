@echo off
REM ADRD Knowledge Graph Deployment Script for Windows
REM This script handles the deployment of the Django + React application

setlocal enabledelayedexpansion

REM Colors for output (limited in Windows CMD)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM Function to check if command exists
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo %ERROR% Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

where docker-compose >nul 2>&1
if %errorlevel% neq 0 (
    echo %ERROR% Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo %SUCCESS% All prerequisites are met.

REM Setup environment
echo %INFO% Setting up environment...

if not exist .env (
    if exist env.example (
        echo %WARNING% .env file not found. Creating from env.example...
        copy env.example .env
        echo %WARNING% Please edit .env file with your production settings before continuing.
        pause
    ) else (
        echo %ERROR% .env file not found and no env.example available.
        exit /b 1
    )
)

REM Create necessary directories
if not exist logs mkdir logs
if not exist data mkdir data
if not exist data\postgres mkdir data\postgres
if not exist data\redis mkdir data\redis

echo %SUCCESS% Environment setup complete.

REM Parse command line arguments
set "command=%1"
if "%command%"=="" set "command=deploy"

if "%command%"=="deploy" goto :deploy
if "%command%"=="start" goto :start
if "%command%"=="stop" goto :stop
if "%command%"=="restart" goto :restart
if "%command%"=="logs" goto :logs
if "%command%"=="status" goto :status
if "%command%"=="clean" goto :clean
if "%command%"=="help" goto :help
goto :unknown

:deploy
echo %INFO% Building and starting services...

REM Build images
echo %INFO% Building Docker images...
docker-compose build --no-cache

REM Start services
echo %INFO% Starting services...
docker-compose up -d

REM Wait for services to be ready
echo %INFO% Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Run migrations
echo %INFO% Running Django migrations...
docker-compose exec backend python manage.py migrate --noinput

REM Load sample data
echo %INFO% Loading sample data...
docker-compose exec backend python manage.py load_sample_data

REM Collect static files
echo %INFO% Collecting static files...
docker-compose exec backend python manage.py collectstatic --noinput

REM Ask if user wants to create superuser
set /p "create_superuser=Do you want to create a Django superuser? (y/n): "
if /i "%create_superuser%"=="y" (
    echo %INFO% Creating Django superuser...
    docker-compose exec backend python manage.py createsuperuser
)

goto :show_info

:start
echo %INFO% Starting existing deployment...
docker-compose up -d
goto :show_info

:stop
echo %INFO% Stopping deployment...
docker-compose down
echo %SUCCESS% Deployment stopped.
goto :end

:restart
echo %INFO% Restarting deployment...
docker-compose restart
goto :show_info

:logs
docker-compose logs -f
goto :end

:status
docker-compose ps
goto :end

:clean
echo %WARNING% This will remove all containers, volumes, and data. Are you sure?
set /p "confirm=Type 'yes' to confirm: "
if "%confirm%"=="yes" (
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo %SUCCESS% Cleanup complete.
) else (
    echo %INFO% Cleanup cancelled.
)
goto :end

:help
echo Usage: %0 [command]
echo.
echo Commands:
echo   deploy    Full deployment (default)
echo   start     Start existing deployment
echo   stop      Stop deployment
echo   restart   Restart deployment
echo   logs      Show service logs
echo   status    Show service status
echo   clean     Remove all containers and data
echo   help      Show this help message
goto :end

:unknown
echo %ERROR% Unknown command: %1
echo Use '%0 help' for available commands.
exit /b 1

:show_info
echo.
echo %SUCCESS% ADRD Knowledge Graph deployed successfully!
echo.
echo Service Information:
echo   Frontend: http://localhost
echo   Backend API: http://localhost/api/
echo   Django Admin: http://localhost/admin/
echo   Health Check: http://localhost/health
echo.
echo Docker Services:
docker-compose ps
echo.
echo Service Logs:
echo   View all logs: docker-compose logs
echo   View backend logs: docker-compose logs backend
echo   View frontend logs: docker-compose logs frontend
echo   View database logs: docker-compose logs db
echo.
echo Management Commands:
echo   Stop services: docker-compose down
echo   Restart services: docker-compose restart
echo   Update services: docker-compose pull ^&^& docker-compose up -d
echo   View service status: docker-compose ps
echo.
echo Django Management:
echo   Django shell: docker-compose exec backend python manage.py shell
echo   Create superuser: docker-compose exec backend python manage.py createsuperuser
echo   Run migrations: docker-compose exec backend python manage.py migrate

:end
endlocal
