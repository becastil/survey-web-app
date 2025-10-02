#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      } else {
        resolve(undefined);
      }
    });
    child.on("error", (error) => reject(error));
  });

const rawArgs = process.argv.slice(2);
const buildArgs = rawArgs.filter((arg) => arg.startsWith("--"));

const ignoredArgs = rawArgs.filter((arg) => !arg.startsWith("--"));
if (ignoredArgs.length > 0) {
  console.warn(
    "Ignoring unexpected build arguments:",
    ignoredArgs.join(" ")
  );
}

const ensureDependencies = async () => {
  const hasNext = existsSync("node_modules/next/package.json");
  if (!hasNext) {
    await run("npm", ["install", "--include=dev", "--prefer-offline"]);
  }
};

try {
  await ensureDependencies();
  console.log("Building Next.js application for static export...");
  await run("npx", ["--yes", "next@14.2.7", "build", ...buildArgs]);
  console.log("Build completed successfully!");
} catch (error) {
  console.error("Render build failed:", error);
  process.exit(1);
}
