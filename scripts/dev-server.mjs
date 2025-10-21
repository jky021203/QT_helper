#!/usr/bin/env node
import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";

function selectLocalAddress() {
  const nets = networkInterfaces();
  const preferredOrder = [
    "en0",
    "en1",
    "en2",
    "eth0",
    "Wi-Fi",
    "wlan0",
    "wlan1"
  ];

  const candidates = [];

  for (const [name, addresses] of Object.entries(nets)) {
    if (!addresses) continue;
    for (const net of addresses) {
      if (net.family === "IPv4" && !net.internal) {
        candidates.push({ name, address: net.address });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const preferred = preferredOrder
    .map((iface) => candidates.find((item) => item.name === iface))
    .find(Boolean);

  return preferred?.address ?? candidates[0].address;
}

const localAddress = selectLocalAddress() ?? "0.0.0.0";

const child = spawn(
  "next",
  ["dev", "--hostname", localAddress],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      HOST: localAddress
    }
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("[dev-server] Failed to start Next.js dev server:", error);
  process.exit(1);
});
