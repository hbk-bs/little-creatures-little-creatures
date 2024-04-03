import os from "node:os";
import dns from "node:dns/promises";

export async function getHostnameAndIP() {
  try {
    // Get hostname
    const hostname = os.hostname();
    // Get IP
    const { address } = await dns.lookup(hostname);

    return { hostname, address, error: null };
  } catch (error) {
    return { error };
  }
}
