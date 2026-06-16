import { chromium } from "playwright";
import { spawn } from "child_process";
import * as path from "path";

async function main() {
  const server = spawn("npm", ["run", "dev", "--", "-p", "3099"], {
    cwd: path.join(__dirname, ".."),
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise<void>((resolve, reject) => {
    server.stdout?.on("data", (d: Buffer) => {
      const s = d.toString();
      process.stdout.write(s);
      if (s.includes("Ready in")) resolve();
    });
    server.on("exit", (code) => reject(new Error(`Server exited: ${code}`)));
  });
  await new Promise((r) => setTimeout(r, 1000));

  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 2100 });

  // Listen for console errors
  page.on("console", (msg) => console.log(`[browser] ${msg.type()}: ${msg.text()}`));
  page.on("pageerror", (err) => console.error(`[pageerror]`, err.message));

  await page.goto("http://localhost:3099/roadtrip", { waitUntil: "networkidle" });
  await new Promise((r) => setTimeout(r, 5000));

  // Check what elements exist
  const bodyHtml = await page.evaluate(() => document.body.innerHTML.slice(0, 2000));
  console.log("Body HTML preview:", bodyHtml);

  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[id]")).map((el) => el.id)
  );
  console.log("IDs found:", ids);

  await page.screenshot({ path: "/tmp/debug-roadtrip.png", fullPage: false });
  console.log("Screenshot saved to /tmp/debug-roadtrip.png");

  await browser.close();
  server.kill();
}

main().catch(console.error);
