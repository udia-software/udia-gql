import Auth from "../../modules/auth";

describe("Auth", () => {
  it("should hash and verify a password", async () => {
    const pass = "Hunter2";
    const hashHeader = /^\$argon2id\$v=19\$m=32768,t=7,p=2\$.*$/;

    expect.assertions(4);
    const hash = await Auth.hashPassword(pass);
    expect(hash).toMatch(hashHeader);
    const matches = await Auth.verifyPassword(hash, pass);
    expect(matches).toBeTruthy();
    const notMatches = await Auth.verifyPassword(hash, "badPass");
    expect(notMatches).toBeFalsy();
    const notMatches2 = await Auth.verifyPassword("badhash", pass);
    expect(notMatches2).toBeFalsy();
  });

  it("should sign and verify a JWT", () => {
    const testUuid = "bd14ef1e-4cb8-4f8e-9a68-d2b839cb4052";
    const jwtHeader = /^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*$/;

    expect.assertions(5);
    const jwt = Auth.signUserJWT(testUuid);
    expect(jwt).toMatch(jwtHeader);
    const payload = Auth.verifyUserJWT(jwt);
    expect(payload).toHaveProperty("uuid", testUuid);
    expect(payload).toHaveProperty("exp");
    expect(payload).toHaveProperty("iat");
    const badPayload = Auth.verifyUserJWT(jwt + "trash");
    expect(badPayload).toStrictEqual({});
  });
});
