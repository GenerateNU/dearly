# Start the PostgreSQL container in the background
docker-compose -f ./docker-compose.yml up -d # Use the correct relative path to docker-compose.yml
timeout=5
elapsed=0

until pg_isready -h localhost -p 5432; do
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "pg_isready timeout after $timeout seconds."
    exit 1
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done

NODE_ENV=test
bun test

# Stop and remove the Docker container after tests finish
docker-compose -f ./docker-compose.yml down --volumes
