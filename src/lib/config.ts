import "server-only";

export function config() {
  const profile = process.env.APP_PROFILE ?? "prod";
  if (profile !== "dev" && profile !== "prod")
    throw new Error("APP_PROFILE must be dev or prod");
  const apiUrl = process.env.API_BASE_URL ?? "http://localhost:8080";
  const url = new URL(apiUrl);
  if (
    profile === "prod" &&
    url.protocol !== "https:" &&
    url.hostname !== "localhost"
  )
    throw new Error("Production API must use HTTPS");
  return { profile, apiUrl: url.origin };
}
