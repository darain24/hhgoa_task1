import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("contains the required frame generator capabilities", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /Builder ID/);
  assert.match(page, /PFP Frame/);
  assert.match(page, /Squad Frame/);
  assert.match(page, /chooseSquadSlot/);
  assert.match(page, /removeSquadPhoto/);
  assert.match(page, /Add photo to next empty frame/);
  assert.match(page, /chooseSinglePhoto/);
  assert.match(page, /removeSinglePhoto/);
  assert.match(page, /Replace photo/);
  assert.match(page, /heic2any/);
  assert.match(page, /x\.com\/intent\/post/);
  assert.match(page, /target = "_blank"/);
  assert.match(page, /#FrameInGoa/);
  assert.match(layout, /og\.png/);
  assert.match(layout, /Imbue/);
  assert.match(layout, /Victor_Mono/);
  assert.match(styles, /#0b6839/i);
  assert.match(styles, /#fee101/i);
  assert.match(styles, /#ff0080/i);
});

test("is a clean Vercel-ready Next.js project", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const vercelConfig = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(packageJson.scripts.build, "next build");
  assert.ok(packageJson.dependencies.next);
  assert.equal(packageJson.dependencies.vinext, undefined);
  assert.equal(vercelConfig.framework, "nextjs");
  assert.equal(vercelConfig.outputDirectory, null);
  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
  await assert.rejects(access(new URL("../vite.config.ts", import.meta.url)));
  await assert.rejects(access(new URL("../worker/index.ts", import.meta.url)));
});
