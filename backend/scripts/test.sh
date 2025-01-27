# Start the PostgreSQL container in the background
timeout=5
elapsed=0

setup() {
  docker-compose -f ./docker-compose.yml up -d # Use the correct relative path to docker-compose.yml
}

ready() {
  until pg_isready -h localhost -p 5432; do
    if [ "$elapsed" -ge "$timeout" ]; then
      echo "pg_isready timeout after $timeout seconds."
      exit 1
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done
}

teardown() {
  # Stop and remove the Docker container after tests finish
  docker-compose -f ./docker-compose.yml down --volumes
}

run() {
  setup
  ready
  NODE_ENV=test
  if [ $# -eq 0 ]; then
    bun test 
  elif [ $# -eq 1 ]; then
    bun test $1
  elif [ $# -ge 2 ]; then
    local test_name_pattern="${@:3}"
    bun test --test-name-pattern "$test_name_pattern" $1
  fi
  teardown
}

run $@
