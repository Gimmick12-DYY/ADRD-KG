#!/bin/bash

echo "Starting ADRD Knowledge Graph Application (Django Backend)..."

# Start Backend (Django)
echo "Starting Django Backend Server..."
cd backend

# Install Django dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing Django dependencies..."
pip install -r ../requirements.txt

# Run Django migrations and start server
python app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start Frontend
echo "Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Both servers started!"
echo "Django Backend API: http://localhost:5000"
echo "Django Admin: http://localhost:5000/admin/"
echo "Frontend App: http://localhost:5173"
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait