# Load the environment variables

ENV_PATH=.env
BUN_PATH=./bin/bun

if [ ! -f $ENV_PATH ]; then
  echo ".env file doesn't exist, make sure you are in the root directory when invoking this script."
  exit 1
fi

if [ ! -f $BUN_PATH ]; then
  echo "$BUN_PATH does not exist, are you in the nix shell?"
  exit 1
fi

export PATH=$PATH:$BUN_PATH

echo "Environment variables successfully loaded"

echo "Building docker image..."

docker build --pull -t dearly_backend .

if [ $# -eq 0 ]; then
  docker run -i -t --env-file=$ENV_PATH dearly_backend:latest /bin/bash
elif [ $# -eq 1 ]; then
  docker run -p $1:$1 -i -t --env-file=$ENV_PATH dearly_backend:latest /bin/bash
fi
