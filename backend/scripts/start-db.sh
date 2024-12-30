#!/bin/bash

# Start the containers in detached mode
docker-compose -f ./docker-compose.yml up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."

while ! docker exec -it $(docker ps -qf "name=backend-postgres-1") pg_isready -U testuser > /dev/null 2>&1; do
    sleep 1
done

# PostgreSQL is ready
echo "Local PostgreSQL database is running at localhost:5432"
