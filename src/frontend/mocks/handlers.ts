import { http, HttpResponse } from "msw";
import { getJwks, verify } from "verify-rsa-jwt-cloudflare-worker";

export const handlers = [
  http.get("https://example.com/protected", async ({ request }) => {
    // TODO: Unused.
    const bearToken = request.headers.get("Authorization")?.split(" ")[1];
    if (bearToken) {
      try {
        const jwks = await getJwks(
          import.meta.env.VITE_AUTH0_WELL_KNOWN_JWKS_URL,
        );
        const { payload } = await verify(bearToken, jwks);
        return HttpResponse.json({
          ...(payload as Record<string, unknown>),
          "i-am-protected": "Whoohoo!",
        });
      } catch (error) {
        return unauthenticatedResponse;
      }
    }
    return unauthenticatedResponse;
  }),
];

const unauthenticatedResponse = HttpResponse.json(
  {
    error: "Unauthorized",
  },
  { status: 401 },
);
