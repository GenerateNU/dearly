# Load the environment variables

ENV_PATH=.env

if [ ! -f $ENV_PATH ]; then
  echo ".env file doesn't exist, make sure you are in the root directory when invoking this script."
  exit 1
fi

source .env

echo "Environment variables successfully loaded"

docker build --pull -t dearly .
