import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const outDir = path.resolve("scripts/verify-out");
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  protocolTimeout: 60000,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

const viewports = [
  [320, 720],
  [375, 812],
  [768, 1024],
  [1040, 800],
  [1440, 900],
];

const routes = [
  "/",
  "/about",
  "/services",
  "/services/films",
  "/work",
  "/work/commercial-film",
  "/clients",
  "/contact",
  "/privacy",
  "/terms",
  "/this-page-does-not-exist",
];

const problems = [];

function note(message) {
  problems.push(message);
  console.log("ISSUE", message);
}

async function measure(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      title: document.title,
      h1: document.querySelector("h1")?.innerText?.replace(/\s+/g, " ").trim() || "",
    };
  });
}

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

for (const [width, height] of viewports) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  for (const route of routes) {
    errors.length = 0;
    try {
      await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForSelector("h1", { timeout: 8000 });
    } catch (error) {
      note(`${width} ${route} navigation ${error.message}`);
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
    const result = await measure(page);
    if (result.scrollWidth > result.clientWidth + 1) {
      note(`${width} ${route} overflow ${result.scrollWidth}>${result.clientWidth}`);
    }
    console.log(`ok ${width} ${route} ${result.h1}`);
    if (!result.h1) note(`${width} ${route} missing h1`);
    if (errors.length) note(`${width} ${route} console ${errors.join(" | ")}`);
  }
}

await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1");
await page.screenshot({ path: path.join(outDir, "home-1440.png") });

await page.setViewport({ width: 375, height: 812 });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1");
await page.screenshot({ path: path.join(outDir, "home-375.png") });

await page.setViewport({ width: 320, height: 700 });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1");
await page.screenshot({ path: path.join(outDir, "home-320.png") });

const menu = await page.$(".menu-toggle");
await menu.click();
await new Promise((resolve) => setTimeout(resolve, 300));
const menuOpen = await page.$eval(".mobile-nav", (el) => el.classList.contains("is-open"));
if (!menuOpen) note("mobile menu did not open");
await page.screenshot({ path: path.join(outDir, "menu-320.png") });
await page.click(".mobile-nav a[href='/about']");
await page.waitForFunction(() => location.pathname === "/about");
const stillOpen = await page.$eval(".mobile-nav", (el) => el.classList.contains("is-open"));
if (stillOpen) note("mobile menu stayed open after navigation");

await page.setViewport({ width: 768, height: 1024 });
await page.goto("http://127.0.0.1:5173/work", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1");
await page.screenshot({ path: path.join(outDir, "work-768.png") });
await page.click(".filters button:nth-of-type(2)");
const pressed = await page.$eval(".filters button:nth-of-type(2)", (el) => el.getAttribute("aria-pressed"));
if (pressed !== "true") note("work filter did not activate");

await page.setViewport({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5173/contact", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1");
await page.click("button[type=submit]");
await page.waitForSelector(".field-error");
const invalid = await page.$eval(".form-status", (el) => el.textContent);
if (!invalid.toLowerCase().includes("correct")) note(`empty form status: ${invalid}`);

await page.type("#main input[name=name]", "Asha Verma");
await page.type("#main input[name=email]", "asha@example.com");
await page.select("#main select[name=service]", "Films");
await page.type("#main textarea[name=message]", "We need a short brand film for a product launch this season.");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector(".form-status")?.textContent?.includes("not connected"));
await page.screenshot({ path: path.join(outDir, "contact-390.png") });

await page.setViewport({ width: 1280, height: 800 });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1");
await page.click("a[href='/work']");
await page.waitForFunction(() => location.pathname === "/work");
const workTitle = await page.$eval("h1", (el) => el.textContent.trim());
if (!workTitle) note("explore work did not open a titled page");

await page.goto("http://127.0.0.1:5173/services/missing", { waitUntil: "domcontentloaded" });
await page.waitForSelector("h1");
const missing = await page.$eval("h1", (el) => el.textContent.trim());
if (missing !== "Page not found") note(`bad service slug rendered ${missing}`);

console.log(problems.length ? `FAILED ${problems.length}` : "PASSED");
await browser.close();
process.exit(problems.length ? 1 : 0);
