import { bffGraphqlUrl } from "./bff";

export type ServiceState = "ready" | "unavailable" | "unconfigured";
export type ServiceStatus = { backend: ServiceState; ai: ServiceState };

/** No identity is sent, and only fixed, server-configured destinations are used. */
export async function probeServices(): Promise<ServiceStatus> {
  try {
    const url = new URL(bffGraphqlUrl);
    url.pathname = "/system/status";
    url.search = "";
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4500),
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) throw new Error("Probe failed");
    const body = await response.json();
    const state = (value: unknown): ServiceState =>
      value === "ready" || value === "unconfigured" ? value : "unavailable";
    return { backend: state(body.backend), ai: state(body.ai) };
  } catch {
    return { backend: "unavailable", ai: "unavailable" };
  }
}
