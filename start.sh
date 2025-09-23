#!/bin/bash

echo "🚀 Starting ADRD Knowledge Graph Application..."

# Start Backend
echo "🔧 Starting Backend Server..."
cd backend
python app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📊 Backend API: http://localhost:5000"
echo "🎨 Frontend App: http://localhost:5173"
echo "💡 Press Ctrl+C to stop both servers"

# Wait for user to stop
wait