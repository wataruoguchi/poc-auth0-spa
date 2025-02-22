import { createAuth0Client } from "@auth0/auth0-spa-js";
import { setupCounter } from "./counter.ts";
import "./style.css";

const currentUrl = new URL(window.location.href);

const isCallback =
  (currentUrl.search.includes("state=") &&
    currentUrl.search.includes("code=")) ||
  currentUrl.search.includes("error=");

async function renderScreen() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser.ts");
    await worker.start();
  }

  const auth0 = await createAuth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    useRefreshTokens: true,
    cacheLocation: "localstorage", // There will be a problem in our legacy application that would remove the in-memory cache. We want this to keep the user's session alive.
    authorizationParams: {
      redirect_uri: import.meta.env.VITE_MY_CALLBACK_URL,
      connection_id: "wataru-database",
    },
  });

  if (isCallback) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  const isAuthenticated = await auth0.isAuthenticated();

  if (!isAuthenticated) {
    document.querySelector<HTMLButtonElement>("#app")!.innerHTML = `
    <div>
    <button id="login">Login</button>
    <button id="protected">Fetch Protected Data</button>
    </div>
  `;
    document.getElementById("login")?.addEventListener("click", async (e) => {
      e.preventDefault();
      await auth0.loginWithRedirect();
    });
  } else {
    const user = await auth0.getUser();
    if (!user) {
      document.querySelector<HTMLButtonElement>("#app")!.innerHTML = `
    <div>User not found</div>
    `;
    } else {
      document.querySelector<HTMLButtonElement>("#app")!.innerHTML = `
    <div>
    <h1>Welcome ${user.name}</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <button id="protected">Fetch Protected Data</button>
    <button id="logout">Logout</button>
    </div>
  `;
      document
        .getElementById("logout")
        ?.addEventListener("click", async (e) => {
          e.preventDefault();
          await auth0.logout({
            logoutParams: {
              returnTo: import.meta.env.VITE_MY_LOGOUT_URL,
            },
          });
        });

      setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
    }
  }

  document.getElementById("protected")?.addEventListener("click", async (e) => {
    e.preventDefault();
    const response = await fetch("/api/protected", {
      headers: {
        ...(await fetchAuthHeaders()),
      },
    });
    if (!response.ok) {
      console.error(response);
    } else {
      const data = await response.json();
      console.log(data);
    }
  });

  async function fetchAuthHeaders() {
    try {
      const accessToken = await auth0.getTokenSilently();
      return {
        Authorization: `Bearer ${accessToken}`,
      };
    } catch (error) {
      return undefined;
    }
  }
}
renderScreen();
