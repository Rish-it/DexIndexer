#!/bin/bash

# Kill any processes running on ports 3000 and 3001
echo "Stopping any existing processes on ports 3000 and 3001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start the application
echo "Starting the Blockchain Indexer application..."
npm start 