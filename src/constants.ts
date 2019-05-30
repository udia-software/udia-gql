export const JWT_SECRET = process.env.JWT_SECRET || "DEVELOPMENT_SECRET";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const USERS_TABLE = process.env.USERS_TABLE || "users-udia-gql-dev";
export const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
export const DYNAMODB_REGION = process.env.DYNAMODB_REGION || "dev";
export const DYNAMODB_KEY_ID = process.env.DYNAMODB_KEY_ID || "AKIAIOSFODNN7EXAMPLE";
export const DYNAMODB_KEY_SECRET = process.env.DYNAMODB_KEY_SECRET || "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
