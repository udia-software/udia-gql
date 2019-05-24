#!/usr/bin/env bash
# Helper script to create local tables for development
# serverless-dynamodb-local didn't work, so this with docker is the workaround

aws dynamodb create-table \
  --endpoint-url http://localhost:8000 \
  --table-name users-udia-gql-dev \
  --attribute-definitions AttributeName=uuid,AttributeType=S \
      AttributeName=username,AttributeType=S \
  --key-schema AttributeName=uuid,KeyType=HASH \
      AttributeName=username,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
