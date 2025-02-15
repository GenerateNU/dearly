echo "Building the docker image..."

docker build -t nudge_lambda .

docker run -p 9000:8080 nudge_lambda
