#!/usr/bin/env node
import { spawn } from "node:child_process";

const run = (command, args) =>
  new Promise((resolve, reject) => {
    console.log(`Starting Next.js server: ${command} ${args.join(" ")}`);
    const child = spawn(command, args, { stdio: "inherit", shell: false });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      } else {
        resolve(undefined);
      }
    });
    child.on("error", (error) => reject(error));
  });

try {
  // Start Next.js production server
  await run("npx", ["--yes", "next@14.2.7", "start"]);
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}