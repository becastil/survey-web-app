#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

const run = (command, args) =>
  new Promise((resolve, reject) => {
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

const args = process.argv.slice(2);

const ensureDependencies = async () => {
  const hasNext = existsSync("node_modules/next/package.json");
  if (!hasNext) {
    await run("npm", ["install", "--include=dev", "--prefer-offline"]);
  }
};

try {
  await ensureDependencies();
  await run("npx", ["--yes", "next@14.2.7", "build", ...args]);
} catch (error) {
  console.error("Render build failed:", error);
  process.exit(1);
}
