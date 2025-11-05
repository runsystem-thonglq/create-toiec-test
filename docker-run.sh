#!/bin/bash

echo "Building and running TOEIC Test App with Docker..."
echo

echo "Building Docker image..."
docker build -t toeic-test-app .

if [ $? -ne 0 ]; then
    echo "Error building Docker image!"
    exit 1
fi

echo
echo "Starting container..."
docker run -d -p 3000:3000 --name toeic-test-app-container toeic-test-app

if [ $? -ne 0 ]; then
    echo "Error starting container!"
    exit 1
fi

echo
echo "TOEIC Test App is now running!"
echo "Open your browser and go to: http://localhost:3000"
echo
echo "To stop the container, run: docker stop toeic-test-app-container"
echo "To remove the container, run: docker rm toeic-test-app-container"
