#!/bin/bash

export APP_PASSWORD=want2run

echo "🏌️ Starting Golf Tracker..."
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

npm run dev
