import { Context, Hono } from "hono";
import { renderToString } from "react-dom/server";
import { jwk } from "hono/jwk";

const app = new Hono();

app.use(
  "/api/*",
  jwk({
    jwks_uri: import.meta.env.VITE_AUTH0_WELL_KNOWN_JWKS_URL,
  }),
);

app.get("/api/protected", async (c: Context) => {
  const jwtPayload = c.get("jwtPayload");
  return c.json({
    ...(jwtPayload as Record<string, unknown>),
    "i-am-protected": "Whoohoo!",
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
          <div id="app"></div>
          <script type="module" src="/src/frontend/main.ts"></script>
        </body>
      </html>,
    ),
  );
});

export default app;
