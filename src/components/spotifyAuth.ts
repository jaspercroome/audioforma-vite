import { spotifyAccessTokenKey, spotifyExpiryKey, spotifyRefreshTokenKey } from "./utils";

export const getSpotifyAuthorization = async (
  clientId: string
) => {
  console.log('getting auth!')
  const baseUrl = window.location.origin;

  const accessToken = localStorage.getItem(spotifyAccessTokenKey);
  const expiryTimeString = localStorage.getItem(spotifyExpiryKey);
  const isStale = new Date(expiryTimeString ?? "") < new Date();
  if (accessToken && !isStale) {
    return accessToken;
  }
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", `${baseUrl}`);
  params.append("scope", "user-library-read");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
};
function generateCodeVerifier(length: number) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export const getAccessToken = async (
  clientId: string,
  code: string
) => {
  const storedAccessToken = localStorage.getItem(spotifyAccessTokenKey);
  const storedRefreshToken = localStorage.getItem(spotifyRefreshTokenKey);
  // const expiryDateTime = localStorage.getItem(spotifyExpiryKey);
  // const isStale = new Date() >= new Date(expiryDateTime ?? "");

  console.log({storedAccessToken,storedRefreshToken})

  if (storedAccessToken && storedRefreshToken) {
    return storedAccessToken;
  } else {
    const baseUrl = window.location.origin;
    if (storedAccessToken === null || storedRefreshToken === null) {
      const verifier = localStorage.getItem("verifier");

      const params = new URLSearchParams();
      params.append("client_id", clientId);
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", `${baseUrl}`);
      params.append("code_verifier", verifier!);

      const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
      const data = await result.json();
      const { access_token, refresh_token, expires_in } = data;
      const now = new Date();
      const expirationDate = Number(now) + expires_in * 1000;
      localStorage.setItem(spotifyAccessTokenKey, access_token);
      localStorage.setItem(spotifyExpiryKey, expirationDate.toString());
      if (refresh_token) {
        localStorage.setItem(spotifyRefreshTokenKey, refresh_token);
      }
      return access_token as string;
    } else {
      const url = "https://accounts.spotify.com/api/token";
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: storedRefreshToken,
          client_id: clientId,
        }),
      };
      const body = await fetch(url, payload);
      const response = await body.json();
      localStorage.setItem(spotifyAccessTokenKey, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(spotifyRefreshTokenKey, response.refreshToken);
      }
      return response.accessToken as string;
    }
  }
};
export const refreshAccessToken = async (clientId: string) => {
  // refresh token that has been previously stored
  const refreshToken = localStorage.getItem(spotifyRefreshTokenKey);
  const url = "https://accounts.spotify.com/api/token";

  if (refreshToken) {
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    };
    const body = await fetch(url, payload);
    const response = await body.json();
    const { access_token, expires_in, refresh_token } = response;
    localStorage.setItem(spotifyAccessTokenKey, access_token);

    if (response.expires_in) {
      const now = Number(new Date());
      const expirationDate = (now + expires_in * 1000).toString();
      localStorage.setItem(spotifyExpiryKey, expirationDate);
    }

    if (response.refreshToken) {
      localStorage.setItem(spotifyRefreshTokenKey, refresh_token);
    }
  }
};