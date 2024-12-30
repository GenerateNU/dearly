#!/bin/bash

docker-compose -f ./docker-compose.yml down --volumes
echo "Local PostgreSQL database stopped."
