let managementApiToken: string | null = null;

export async function getManagementApiToken() {
  if (managementApiToken) {
    return managementApiToken;
  }

  const data = await fetchToken();
  managementApiToken = data.access_token;
  return managementApiToken;
}

export async function getUser(
  userId: string,
): Promise<{ email: string; name: string }> {
  return await requestWithToken({
    url: `${import.meta.env.VITE_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}`,
  });
}

async function requestWithToken<T>(options: { url: string }): Promise<T> {
  const headers = {
    Authorization: `Bearer ${await getManagementApiToken()}`,
  };
  const { url, ...rest } = options;
  const response = await fetch(url, {
    ...rest,
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to request with token", { cause: response });
  }
  return await response.json();
}

async function fetchToken() {
  const response = await fetch(
    `${import.meta.env.VITE_AUTH0_ISSUER_BASE_URL}/oauth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: import.meta.env.VITE_AUTH0_M2M_CLIENT_ID,
        client_secret: import.meta.env.VITE_AUTH0_M2M_CLIENT_SECRET,
        grant_type: "client_credentials",
        audience: `${import.meta.env.VITE_AUTH0_ISSUER_BASE_URL}/api/v2/`,
      }),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch token", { cause: response });
  }
  return await response.json<{ access_token: string }>();
}
