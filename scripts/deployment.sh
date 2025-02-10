# Load the environment variables

ENV_PATH=.env
BUN_PATH=./bin/bun

if [ ! -f $ENV_PATH ]; then
  echo ".env file doesn't exist, make sure you are in the root directory when invoking this script."
  return
fi

if [ ! -f $BUN_PATH ]; then
  echo "$BUN_PATH does not exist, are you in the nix shell?"
  return
fi

if [ $# -eq 0 ]; then
  echo "Please supply the port to run on for this docker container. I recommend 3000."
  return
fi

export PATH=$PATH:$BUN_PATH

echo "Environment variables successfully loaded"

echo "Building docker image..."

docker build --pull -t dearly_backend .

if [ $# -eq 1 ]; then
  docker run -p $1:$1 -i -t --env-file=$ENV_PATH dearly_backend:latest /bin/bash
  return
fi

echo "Make sure there is exactly one port being passed as args."
