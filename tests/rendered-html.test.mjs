import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Frame in Goa generator", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Frame in Goa/);
  assert.match(html, /YOUR FRAME/);
  assert.match(html, /Builder ID/);
  assert.match(html, /PFP Frame/);
  assert.match(html, /Squad Frame/);
  assert.match(html, /Share to X/);
  assert.match(html, /#FrameInGoa/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("ships the required image and sharing capabilities", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.match(page, /image\/png/);
  assert.match(page, /heic2any/);
  assert.match(page, /navigator\.share/);
  assert.match(page, /x\.com\/intent\/post/);
  assert.match(page, /#FrameInGoa/);
  assert.match(layout, /og\.png/);
  assert.match(packageJson, /"heic2any"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
