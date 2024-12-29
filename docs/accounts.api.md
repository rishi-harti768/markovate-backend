# Account

### Fetch dashboard

under dev

- URL: `/get-dashboard`
- method : `POST`
- body : `{email, password}`
- credentials : true
- response :
  ```
  EMPTY_FIELDS //for missing body args
  INVALID_EMAIL_FORMAT // for invalid email
  WEAK_PASSWORD   //for weak password
  EMAIL_ALREADY_EXISTS // id already an accounts exist with that email
  AUTHED // success with along with cookies as a response
  ```

### Account Login

access existing account with email and password, user gets access token and refresh tokens.

- URL: `/auth/login`
- method : `POST`
- body : `{email, password}`
- response :
  ```
  EMPTY_FIELDS //for missing body args
  INVALID_EMAIL_FORMAT // for invalid email
  WEAK_PASSWORD   //for weak password
  EMAIL_NOT_FOUND  // if no account exist with that email
  INCORRECT_PASSWORD // if password is incorrect
  AUTHED  // success with along with cookies as a response
  ```

### Forgot Password

send an reset password to the account email along with token

- URL: `/auth/forgot-pass`
- method : `POST`
- body : `{email}`
- response :
  ```
  EMPTY_FIELDS //for missing body args
  INVALID_EMAIL_FORMAT // for invalid email
  EMAIL_NOT_FOUND  // if no account exist with that email
  MAIL_SENT  // success
  ```

### Forgot Password Change Password

set new password only if token is valid

- URL: `/auth/forgot-pass/change-pass`
- method : `POST`
- body : `{email, password}`
- response :
  ```
  EMPTY_FIELDS //for missing body args
  INVALID_EMAIL_FORMAT // for invalid email
  WEAK_PASSWORD   //for weak password
  EMAIL_NOT_FOUND  // if no account exist with that email
  INVALID_TOKEN // if token does not match
  PASSWORD_CHANGED  // success
  ```
