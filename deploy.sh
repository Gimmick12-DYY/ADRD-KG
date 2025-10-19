#!/bin/bash

# ADRD Knowledge Graph Deployment Script
# This script handles the deployment of the Django + React application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are met."
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            print_warning ".env file not found. Creating from env.example..."
            cp env.example .env
            print_warning "Please edit .env file with your production settings before continuing."
            read -p "Press Enter after editing .env file..."
        else
            print_error ".env file not found and no env.example available."
            exit 1
        fi
    fi
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    
    print_success "Environment setup complete."
}

# Function to build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    if docker-compose ps | grep -q "unhealthy\|Exit"; then
        print_error "Some services failed to start properly."
        docker-compose logs
        exit 1
    fi
    
    print_success "All services are running successfully."
}

# Function to run Django migrations
run_migrations() {
    print_status "Running Django migrations..."
    
    # Wait for database to be ready
    docker-compose exec backend python manage.py migrate --noinput
    
    # Load sample data
    print_status "Loading sample data..."
    docker-compose exec backend python manage.py load_sample_data
    
    # Collect static files
    print_status "Collecting static files..."
    docker-compose exec backend python manage.py collectstatic --noinput
    
    print_success "Database setup complete."
}

# Function to create superuser
create_superuser() {
    print_status "Creating Django superuser..."
    print_warning "You'll be prompted to create an admin user for the Django admin interface."
    
    docker-compose exec backend python manage.py createsuperuser
    
    print_success "Superuser created successfully."
}

# Function to show deployment info
show_deployment_info() {
    print_success "🚀 ADRD Knowledge Graph deployed successfully!"
    echo
    echo "📋 Service Information:"
    echo "  Frontend: http://localhost"
    echo "  Backend API: http://localhost/api/"
    echo "  Django Admin: http://localhost/admin/"
    echo "  Health Check: http://localhost/health"
    echo
    echo "🐳 Docker Services:"
    docker-compose ps
    echo
    echo "📊 Service Logs:"
    echo "  View all logs: docker-compose logs"
    echo "  View backend logs: docker-compose logs backend"
    echo "  View frontend logs: docker-compose logs frontend"
    echo "  View database logs: docker-compose logs db"
    echo
    echo "🛠️  Management Commands:"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Update services: docker-compose pull && docker-compose up -d"
    echo "  View service status: docker-compose ps"
    echo
    echo "🔧 Django Management:"
    echo "  Django shell: docker-compose exec backend python manage.py shell"
    echo "  Create superuser: docker-compose exec backend python manage.py createsuperuser"
    echo "  Run migrations: docker-compose exec backend python manage.py migrate"
    echo
}

# Function to run health checks
health_check() {
    print_status "Running health checks..."
    
    # Check frontend
    if curl -f http://localhost/health >/dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
    fi
    
    # Check backend API
    if curl -f http://localhost/api/health/ >/dev/null 2>&1; then
        print_success "Backend API is healthy"
    else
        print_error "Backend API health check failed"
    fi
    
    # Check database connection
    if docker-compose exec db pg_isready >/dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_error "Database health check failed"
    fi
}

# Main deployment function
main() {
    echo "🚀 ADRD Knowledge Graph Deployment Script"
    echo "=========================================="
    echo
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            setup_environment
            deploy_services
            run_migrations
            
            # Ask if user wants to create superuser
            read -p "Do you want to create a Django superuser? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                create_superuser
            fi
            
            health_check
            show_deployment_info
            ;;
        "start")
            print_status "Starting existing deployment..."
            docker-compose up -d
            health_check
            show_deployment_info
            ;;
        "stop")
            print_status "Stopping deployment..."
            docker-compose down
            print_success "Deployment stopped."
            ;;
        "restart")
            print_status "Restarting deployment..."
            docker-compose restart
            health_check
            print_success "Deployment restarted."
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "status")
            docker-compose ps
            health_check
            ;;
        "clean")
            print_warning "This will remove all containers, volumes, and data. Are you sure?"
            read -p "Type 'yes' to confirm: " confirm
            if [ "$confirm" = "yes" ]; then
                docker-compose down -v --remove-orphans
                docker system prune -f
                print_success "Cleanup complete."
            else
                print_status "Cleanup cancelled."
            fi
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  deploy    Full deployment (default)"
            echo "  start     Start existing deployment"
            echo "  stop      Stop deployment"
            echo "  restart   Restart deployment"
            echo "  logs      Show service logs"
            echo "  status    Show service status"
            echo "  clean     Remove all containers and data"
            echo "  help      Show this help message"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for available commands."
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
