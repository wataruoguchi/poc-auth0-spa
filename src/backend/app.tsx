import { type Context, Hono } from "hono";
import { renderToString } from "react-dom/server";
import { jwk } from "hono/jwk";
import { getUser, inviteUser } from "./auth0-management-client";

const app = new Hono();

app.use(
  "/api/*",
  jwk({
    jwks_uri: import.meta.env.VITE_AUTH0_WELL_KNOWN_JWKS_URL,
  }),
);

app.post("/api/invite", async (c: Context) => {
  const { email } = await c.req.json();
  try {
    await inviteUser(email);
    return c.json({ message: "User invited" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "Failed to invite user" }, 500);
  }
});

app.get("/api/protected", async (c: Context) => {
  const jwtPayload = c.get("jwtPayload");
  const user = await getUser(jwtPayload.sub);
  console.log(user, jwtPayload);
  return c.json({
    ...(jwtPayload as Record<string, unknown>),
    "i-am-protected": `Whoohoo! ${user.email}`,
  });
});

app.get("*", (c) => {
  return c.html(
    renderToString(
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>PoC Auth0 SPA with Hono</title>
        </head>
        <body>
          <div id="app" />
          <script type="module" src="/src/frontend/main.ts" />
        </body>
      </html>,
    ),
  );
});

export default app;
