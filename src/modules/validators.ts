
export interface IErrorMessage {
  key: string;
  message: string;
}

export const isUsernameSyntaxOK = (username: string, errors: IErrorMessage[]) => {
  const nUsername = username.normalize("NFKC").trim();
  let isValid = true;
  if (nUsername.length > 24) {
    errors.push({
      key: "username",
      message: "Username is too long (over 24 characters)."
    });
    isValid = false;
  } else if (nUsername.length < 3) {
    errors.push({
      key: "username",
      message: "Username is too short (under 3 characters)."
    });
    isValid = false;
  }
  if (RegExp("\\s", "g").test(nUsername)) {
    errors.push({
      key: "username",
      message: "Username should not contain whitespace."
    });
    isValid = false;
  }
  if (nUsername.indexOf("@") >= 0) {
    errors.push({
      key: "username",
      message: "Username should not contain '@' symbol."
    });
  }
  return isValid;
};

export const isEmailValid = (email: string, errors: IErrorMessage[]) => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    errors.push({
      key: "email",
      message: "Email is syntactically invalid."
    });
  }
  return isValid;
};
