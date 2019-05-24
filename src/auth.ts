import { argon2id, hash, verify } from "argon2";
import { sign, verify as jwtVerify } from "jsonwebtoken";
import { JWT_SECRET } from "./constants";

export interface IJwtPayload {
  uuid?: string;
}

export default class Auth {
  private static ARGON_OPTS = {
    hashLength: 32,
    saltLength: 16,
    timeCost: 7,
    memoryCost: 32768,
    parallelism: 2,
    type: argon2id
  }

  private static JWT_OPTS = {
    algorithm: "HS256",
    expiresIn: "30d"
  }
  private static JWT_VERIFY_OPTS = {
    algorithms: ["HS256",]
  }

  /**
   * Given a string client password, hash the password.
   * @param password user supplied password. (should be hashed on client too)
   */
  public static async hashPassword(password: string) {
    return hash(password, this.ARGON_OPTS);
  }

  /**
   * Check whether a password matches a password hash.
   * @param passwordHash server side stored password hash
   * @param password client side provided password
   */
  public static async verifyPassword(
    passwordHash: string | any,
    password: string
  ) {
    try {
      const verified = await verify(passwordHash, password);
      return verified;
    } catch (err) {
      return false;
    }
  }

  /**
   * Create a signed JSON Web Token given a user.
   * @param userInstance instance of the user
   */
  public static signUserJWT(uuid: string) {
    const jwtPayload: IJwtPayload = { uuid };
    return sign(jwtPayload, JWT_SECRET, this.JWT_OPTS);
  }

  /**
   * Return the verified jwt payload, or return null.
   * @param jwt raw token portion of Authorizaton header
   */
  public static verifyUserJWT(jwt: string): IJwtPayload {
    try {
      return jwtVerify(jwt, JWT_SECRET, this.JWT_VERIFY_OPTS) as IJwtPayload;
    } catch {
      return {};
    }
  }
}
