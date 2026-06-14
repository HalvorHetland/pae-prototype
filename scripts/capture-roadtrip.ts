import { chromium } from "playwright";
import { execSync, spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";

const FPS = 30;
const DURATION = 14.5;
const FRAMES = Math.ceil(FPS * DURATION);
const FRAMES_DIR = "/tmp/roadtrip-frames";
const OUTPUT = "/tmp/guidacle-roadtrip.mp4";

async function main() {
  // Clean frames dir
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  // Start dev server
  console.log("Starting dev server...");
  const server = spawn("npm", ["run", "dev", "--", "-p", "3099"], {
    cwd: path.join(__dirname, ".."),
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  // Wait until server is ready
  await new Promise<void>((resolve, reject) => {
    server.stdout?.on("data", (d: Buffer) => {
      const s = d.toString();
      process.stdout.write(s);
      if (s.includes("Ready in")) resolve();
    });
    server.stderr?.on("data", (d: Buffer) => process.stderr.write(d.toString()));
    server.on("exit", (code) => { if (code !== 0) reject(new Error(`Server exited: ${code}`)); });
  });
  await new Promise((r) => setTimeout(r, 2000));
  console.log("Dev server ready.");

  const executablePath =
    "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  // 1080 wide, 1920 + 44px bar = 1964 → scale factor is exactly 1.0
  await page.setViewportSize({ width: 1080, height: 1964 });

  await page.goto("http://localhost:3099/roadtrip", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000); // fonts + first render

  // Pause and reset to t=0
  await page.evaluate(() => {
    const seek = (window as Record<string, unknown>).__seekRoadtrip as ((s: number) => void) | undefined;
    if (seek) seek(0);
  });
  await page.waitForTimeout(500);

  // Canvas occupies top 1920px of the 1964px viewport
  const CLIP = { x: 0, y: 0, width: 1080, height: 1920 };

  console.log(`Capturing ${FRAMES} frames at ${FPS}fps…`);
  for (let i = 0; i < FRAMES; i++) {
    const t = i / FPS;

    await page.evaluate((time) => {
      const seek = (window as Record<string, unknown>).__seekRoadtrip as ((s: number) => void) | undefined;
      if (seek) seek(time);
    }, t);

    // Wait for React re-render
    await page.waitForTimeout(40);

    const framePath = path.join(FRAMES_DIR, `frame_${String(i).padStart(4, "0")}.png`);
    await page.screenshot({ path: framePath, clip: CLIP });

    if (i % FPS === 0) process.stdout.write(`  t=${t.toFixed(1)}s (${i}/${FRAMES})\n`);
  }

  await browser.close();
  server.kill();

  console.log("Encoding MP4…");
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%04d.png" ` +
      `-c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium "${OUTPUT}"`,
    { stdio: "inherit" }
  );

  const size = Math.round(fs.statSync(OUTPUT).size / 1024);
  console.log(`\nDone: ${OUTPUT} (${size} KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
