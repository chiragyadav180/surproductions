import fs from "node:fs";
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu"],
});

const page = await browser.newPage();
page.on("pageerror", (error) => console.log("PAGE", error.message));
page.on("console", (message) => {
  if (message.type() === "error") console.log("CON", message.text());
});

const shots = [
  ["home-1440", 1440, 900, "/"],
  ["home-375", 375, 812, "/"],
  ["home-320", 320, 700, "/"],
  ["about-375", 375, 812, "/about"],
  ["services-768", 768, 1024, "/services"],
  ["work-1024", 1024, 768, "/work"],
  ["project-390", 390, 844, "/work/commercial-film"],
  ["clients-768", 768, 1024, "/clients"],
  ["contact-390", 390, 844, "/contact"],
  ["missing-375", 375, 812, "/missing-page"],
];

fs.mkdirSync("scripts/verify-out", { recursive: true });

for (const [name, width, height, route] of shots) {
  await page.setViewport({ width, height });
  const response = await page.goto(`http://127.0.0.1:5173${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  await page.waitForSelector("h1", { timeout: 10000 });
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const info = await page.evaluate(() => ({
    h1: document.querySelector("h1").innerText.replace(/\s+/g, " ").trim(),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  const overflow = info.scrollWidth > info.clientWidth + 1 ? " OVERFLOW" : "";
  console.log(`${name} ${response.status()} ${info.scrollWidth}/${info.clientWidth}${overflow} ${info.h1}`);
  await page.screenshot({ path: `scripts/verify-out/${name}.png` });
}

await page.setViewport({ width: 320, height: 700 });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".menu-toggle");
await page.click(".menu-toggle");
await page.waitForSelector(".mobile-nav.is-open");
await new Promise((resolve) => setTimeout(resolve, 400));
await page.screenshot({ path: "scripts/verify-out/menu-320.png" });
await Promise.all([
  page.waitForFunction(() => location.pathname === "/about"),
  page.click(".mobile-nav a[href='/about']"),
]);
const menuOpen = await page.$eval(".mobile-nav", (el) => el.classList.contains("is-open"));
console.log("menu closed", !menuOpen);

await page.setViewport({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5173/contact", { waitUntil: "domcontentloaded" });
await page.waitForSelector("button[type=submit]");
await page.click("button[type=submit]");
await page.waitForSelector(".field-error");
await page.type("input[name=name]", "Asha Verma");
await page.type("input[name=email]", "asha@example.com");
await page.select("select[name=service]", "Films");
await page.type("textarea[name=message]", "We need a short brand film for a product launch this season.");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.body.innerText.includes("not connected"));
console.log("form ok");
await page.screenshot({ path: "scripts/verify-out/form-390.png" });

await page.setViewport({ width: 1040, height: 800 });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".desktop-nav");
const nav = await page.evaluate(() => {
  const bar = document.querySelector(".header-bar").getBoundingClientRect();
  const desktop = getComputedStyle(document.querySelector(".desktop-nav")).display;
  return {
    barRight: Math.round(bar.right),
    client: document.documentElement.clientWidth,
    desktop,
    scroll: document.documentElement.scrollWidth,
  };
});
console.log("desktop nav", JSON.stringify(nav));
await page.screenshot({ path: "scripts/verify-out/home-1040.png" });

await browser.close();
