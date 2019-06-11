export const JWT_SECRET = process.env.JWT_SECRET || "DEVELOPMENT_SECRET";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const USERS_TABLE = process.env.USERS_TABLE || "users-udia-gql-dev";
export const DYNAMODB_STAGE = process.env.DYNAMODB_STAGE || "dev";
export const DYNAMODB_ENDPOINT = DYNAMODB_STAGE === "prod" ? undefined : (
  process.env.DYNAMODB_ENDPOINT || "http://localhost:8000");
export const DYNAMODB_REGION = process.env.DYNAMODB_REGION || "us-west-2";
export const DYNAMODB_KEY_ID = process.env.DYNAMODB_KEY_ID || "AKIAIOSFODNN7EXAMPLE";
export const DYNAMODB_KEY_SECRET = process.env.DYNAMODB_KEY_SECRET || "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
// Namespaces used for UUIDv5 payloadId generation
export const USERS_UUID_NS = "0d1a1d1a-2d1a-3d1a-4d1a-5d1a6d1a7d1a";
export const EMAILS_UUID_NS = "1d1a1d1a-2d1a-3d1a-4d1a-5d1a6d1a7d1a";
export const SIGN_UUID_NS = "2d1a1d1a-2d1a-3d1a-4d1a-5d1a6d1a7d1a";
export const ENCRYPT_UUID_NS = "3d1a1d1a-2d1a-3d1a-4d1a-5d1a6d1a7d1a";
