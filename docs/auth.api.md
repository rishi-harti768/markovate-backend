# Auth

### Account Register

create new account with email and password, user gets access token and refresh tokens.

- URL: `/auth/register`
- method : `POST`
- body : `{email, password}`
- response :
  ```json
  {
    "resCodes": <string>,
    "resRoutes": <string>,
    "resErrMsg": <string>
  }
  ```

### Account Login

access existing account with email and password, user gets access token and refresh tokens.

- URL: `/auth/login`
- method : `POST`
- body : `{email, password}`
- response :
  ```json
  {
    "resCodes": <string>,
    "resRoutes": <string>,
    "resErrMsg": <string>
  }
  ```

### Forgot Password

send an reset password to the account email along with token

- URL: `/auth/forgot-pass`
- method : `POST`
- body : `{email}`
- response :
  ```json
  {
    "resCodes": <string>,
    "resRoutes": <string>,
    "resErrMsg": <string>
  }
  ```

### Forgot Password Change Password

set new password only if token is valid

- URL: `/auth/forgot-pass/change-pass`
- method : `POST`
- body : `{email, password}`
- response :
  ```json
  {
    "resCodes": <string>,
    "resRoutes": <string>,
    "resErrMsg": <string>
  }
  ```

---

## Response Codes

1. General:

- `EMPTY_FIELDS` : if input body is empty of missing parameters
- `INVALID_EMAIL_FORMAT` : if email is not supported
- `WEAK_PASSWORD` : if password is weak

2. AUTH specific:

- `AUTH_REGISTER_EMAIL_ALREADY_EXISTS` : if email is already exist during register
- `AUTH_REGISTER_SUCCESS` : if successfully registered
- `AUTH_LOGIN_INVALID_EMAIL_OR_PASSWORD` : if login failed with invalid email or password
- `AUTH_LOGIN_SUCCESS` : if successfully logined
- `AUTH_FP_EMAIL_NOT_FOUND` : if email is not found during forgot password
- `AUTH_FP_INVALID_TOKEN` : if token does not match with the sent email
- `AUTH_FP_EMAIL_SENT` : if email sent successfully
- `AUTH_FP_CHANGED` : if password was changed successfully
