const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const net = require("net");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");
const frontendDir = path.resolve(__dirname, "..");
const backendDir = path.join(rootDir, "backend");
const backendPort = Number(process.env.PORT || 3001);
const frontendPort = Number(process.env.FRONTEND_PORT || 3000);

const nodeCommand = process.execPath;
const parcelCommand = path.join("node_modules", "parcel", "lib", "bin.js");

// ✅ Quote nodeCommand path to handle spaces (e.g. C:\Program Files\...)
const children = [];

function getWindowsRunDirs() {
  if (process.platform !== "win32") {
    return { frontend: frontendDir, backend: backendDir };
  }

  try {
    fs.realpathSync(rootDir);
    return { frontend: frontendDir, backend: backendDir };
  } catch (error) {
    // Fall through to a subst drive when Node cannot stat the user profile root.
  }

  for (const letter of "RSTUVWXYZ") {
    const drive = `${letter}:`;

    if (fs.existsSync(`${drive}\\`)) {
      continue;
    }

    const result = spawnSync("cmd.exe", ["/d", "/s", "/c", `subst ${drive} "${rootDir}"`], {
      stdio: "ignore",
    });

    if (result.status === 0) {
      return {
        frontend: `${drive}\\frontend`,
        backend: `${drive}\\backend`,
      };
    }
  }

  return { frontend: frontendDir, backend: backendDir };
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", () => {
      resolve(false);
    });

    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

(async () => {
  const runDirs = getWindowsRunDirs();
  const backendAlreadyRunning = await isPortOpen(backendPort);

  if (backendAlreadyRunning) {
    console.log(`Backend already running on http://localhost:${backendPort}`);
  } else {
    run("backend", nodeCommand, ["server.js"], runDirs.backend);
  }

  const frontendAlreadyRunning = await isPortOpen(frontendPort);

  if (frontendAlreadyRunning) {
    console.log(`Frontend already running on http://localhost:${frontendPort}`);
  } else {
    // ✅ Quote parcel path to handle spaces in folder name
    run(
      "frontend",
      nodeCommand,
      [
        parcelCommand,
        "index.html",
        "--port",
        String(frontendPort),
      ],
      runDirs.frontend
    );
  }
})();
