# udia-gql
GraphQL Backend for Udia serverless application.

```bash
docker pull amazon/dynamodb-local
# local dynamodb
docker run -p 8000:8000 amazon/dynamodb-local
# new terminal, initialize tables
./init_local_dynamodb.sh
npm start -- --stage dev
# to deploy
npm run deploy -- --stage prod
```
## LICENSE

[Apache-2.0](LICENSE)
