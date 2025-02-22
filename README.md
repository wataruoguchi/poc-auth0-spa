# PoC Auth0 x SPA

This is a PoC Single Page Application that allows you "Login", "Log out", and request a protected resource (mocked). The payload of the request appears in the console.

## References

- [auth0-spa-js/EAMPLES.md](https://github.com/auth0/auth0-spa-js/blob/main/EXAMPLES.md)
- [yusukebe/hono-spa-react](https://github.com/yusukebe/hono-spa-react)

## TODOs

- [x] Setup Auth0 Application
  - [ ] It should not have multiple connections. Because a user created into a database A cannot reset password when a database B is the default.
- [x] Setup Auth0 Database
- [x] Sign Up
  - "Disable Sign Ups" is turned on. We don't need it anyway because we invite users.
- [x] Setup Auth0 M2M (Machine-to-Machine) Application in order to use Management API v2. [Get access tokens](https://auth0.com/docs/secure/tokens/access-tokens/management-api-access-tokens/get-management-api-access-tokens-for-production#get-access-tokens).
- [ ] Invite a user.
  - [x] Create a user.
  - [ ] Make the user set the password.
- [ ] Change Password (Can we redirect to localhost?)
- [ ] Forgot Password (Can we redirect to localhost?)
- [ ] Write E2E tests or equivalent.
