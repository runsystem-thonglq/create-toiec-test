# Docker Setup for TOEIC Test App

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Quick Start

### Method 1: Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop the application
docker-compose down
```

### Method 2: Using Docker Commands

```bash
# Build the image
docker build -t toeic-test-app .

# Run the container
docker run -d -p 3000:3000 --name toeic-test-app-container toeic-test-app

# Stop the container
docker stop toeic-test-app-container

# Remove the container
docker rm toeic-test-app-container
```

### Method 3: Using Scripts

- **Windows**: Run `docker-run.bat`
- **Linux/Mac**: Run `./docker-run.sh`

## Access the Application

Once running, open your browser and go to: http://localhost:3000

## Docker Commands Reference

### Build

```bash
docker build -t toeic-test-app .
```

### Run

```bash
docker run -d -p 3000:3000 --name toeic-test-app-container toeic-test-app
```

### Stop

```bash
docker stop toeic-test-app-container
```

### Remove

```bash
docker rm toeic-test-app-container
```

### View Logs

```bash
docker logs toeic-test-app-container
```

### Enter Container

```bash
docker exec -it toeic-test-app-container sh
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change the port:

```bash
docker run -d -p 3001:3000 --name toeic-test-app-container toeic-test-app
```

Then access at: http://localhost:3001

### Container Already Exists

If you get an error about container name already existing:

```bash
docker rm toeic-test-app-container
```

Then run the container again.

### Build Issues

If you encounter build issues, try:

```bash
docker build --no-cache -t toeic-test-app .
```
