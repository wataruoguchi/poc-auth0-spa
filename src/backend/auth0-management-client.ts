let managementApiToken: string | null = null;

export async function getUser(
  userId: string,
): Promise<{ email: string; name: string }> {
  const response = await fetch(
    `${import.meta.env.VITE_AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${await getManagementApiToken()}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to get user", { cause: response });
  }
  return await response.json();
}

export async function inviteUser(email: string) {
  // TODO: This flow will send the user two emails: One for the email verification, and the other for the password reset.
  await fetch(`${import.meta.env.VITE_AUTH0_ISSUER_BASE_URL}/api/v2/users`, {
    headers: {
      Authorization: `Bearer ${await getManagementApiToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      email,
      username: email.replace("@", "_"),
      password: genPassword(),
      connection: "wataru-database",
    }),
  });
  await fetch(
    `${import.meta.env.VITE_AUTH0_ISSUER_BASE_URL}/dbconnections/change_password`,
    {
      method: "POST",
      body: JSON.stringify({
        email,
        connection: "wataru-database",
        client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
      }),
    },
  );
  return;
}

async function getManagementApiToken() {
  if (managementApiToken) {
    return managementApiToken;
  }

  const data = await fetchToken();
  managementApiToken = data.access_token;
  return managementApiToken;
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

function genPassword() {
  return Math.random().toString(36).slice(-16);
}
