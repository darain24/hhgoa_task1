"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

type Mode = "id" | "pfp" | "squad";
type IdDesign = "coastal" | "horizon";
type Photo = { image: HTMLImageElement; name: string; focusX: number; focusY: number };

const ID_DESIGNS: { id: IdDesign; label: string; blurb: string }[] = [
  { id: "coastal", label: "Coastal Classic", blurb: "Cream badge · hibiscus corners · stamp seal" },
  { id: "horizon", label: "Goa Horizon", blurb: "Sunset header · open cream layout · clear type" },
];

const COLORS = {
  ink: "#0b6839",
  cream: "#fffbe8",
  orange: "#fee101",
  pink: "#ff0080",
  lime: "#fee101",
  cyan: "#fffbe8",
  white: "#ffffff",
  deep: "#064b29",
  sand: "#fff6c8",
  sea: "#0e7a44",
};

const DISPLAY_FONT = '"Imbue", Georgia, serif';
const MONO_FONT = '"Victor Mono", monospace';
const ID_W = 1600;
const ID_H = 1000;
const SQ = 1080;
const SQUAD_SIZE = 3;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  photo: Photo,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const { image, focusX, focusY } = photo;
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = Math.max(0, Math.min(image.naturalWidth - sw, focusX * image.naturalWidth - sw / 2));
  const sy = Math.max(0, Math.min(image.naturalHeight - sh, focusY * image.naturalHeight - sh / 2));
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, weight = 900) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${DISPLAY_FONT}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  } while (size > 28);
  return size;
}

function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number, rotation = -0.08, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.fillStyle = COLORS.lime;
  roundRect(ctx, -130, -52, 260, 104, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 45px ${DISPLAY_FONT}`;
  ctx.fillText("HH GOA '26", 0, -9);
  ctx.font = `700 17px ${MONO_FONT}`;
  ctx.fillText("SHIP • SHARE • REPEAT", 0, 28);
  ctx.restore();
}

function drawNoPhoto(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  gradient.addColorStop(0, "#0b6839");
  gradient.addColorStop(1, "#064b29");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(254,225,1,.16)";
  ctx.lineWidth = 3;
  for (let i = -h; i < w; i += 56) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }

  const pad = Math.max(16, Math.min(w, h) * 0.12);
  const maxWidth = w - pad * 2;
  const lines = w < 420 ? ["YOUR PHOTO", "LANDS HERE"] : ["YOUR PHOTO LANDS HERE"];
  let size = Math.min(28, Math.floor(w * 0.07));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  do {
    ctx.font = `700 ${size}px ${MONO_FONT}`;
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    if (widest <= maxWidth) break;
    size -= 1;
  } while (size > 10);

  const lineGap = size * 1.25;
  const startY = y + h / 2 - ((lines.length - 1) * lineGap) / 2;
  ctx.fillStyle = COLORS.orange;
  lines.forEach((line, index) => {
    ctx.fillText(line, x + w / 2, startY + index * lineGap);
  });
  ctx.textBaseline = "alphabetic";
}

function drawPetal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  width: number,
  rotation: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(width * 0.55, -length * 0.25, width * 0.55, -length * 0.75, 0, -length);
  ctx.bezierCurveTo(-width * 0.55, -length * 0.75, -width * 0.55, -length * 0.25, 0, 0);
  ctx.fill();
  ctx.restore();
}

function drawHibiscus(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, accent = COLORS.orange) {
  const petals = 5;
  for (let i = 0; i < petals; i++) {
    drawPetal(ctx, x, y, size, size * 0.55, (i / petals) * Math.PI * 2, color);
  }
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.beginPath();
  ctx.arc(x, y, size * 0.18, 0, Math.PI * 2);
  ctx.stroke();
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, color = COLORS.ink) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.45, -size * 0.2, size * 0.55, -size * 0.7, 0, -size);
  ctx.bezierCurveTo(-size * 0.55, -size * 0.7, -size * 0.45, -size * 0.2, 0, 0);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,251,232,.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.5, 0, -size * 0.92);
  ctx.stroke();
  ctx.restore();
}

function drawPalmFrond(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number, color = COLORS.ink) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(18, -70, 8, -160);
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const px = 4 + t * 6;
    const py = -18 - t * 140;
    const spread = 42 - t * 18;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + spread, py - 10, px + spread * 1.15, py + 8);
    ctx.quadraticCurveTo(px + spread * 0.4, py + 4, px, py + 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px - spread, py - 10, px - spread * 1.15, py + 8);
    ctx.quadraticCurveTo(px - spread * 0.4, py + 4, px, py + 6);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloralCorner(ctx: CanvasRenderingContext2D, x: number, y: number, flipX = 1, flipY = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX, flipY);
  drawLeaf(ctx, 18, 22, 58, -0.55, COLORS.sea);
  drawLeaf(ctx, 42, 8, 48, 0.35, COLORS.ink);
  drawHibiscus(ctx, 58, 48, 34, COLORS.pink);
  drawHibiscus(ctx, 22, 62, 22, COLORS.orange, COLORS.pink);
  ctx.restore();
}

function formatHandle(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

const SITE_URL = "https://hhgoa-task1-xi.vercel.app/";

function shareBuilderId(builderName: string, team: string) {
  const seed = `${builderName.trim().toLowerCase()}|${team.trim().toLowerCase()}`;
  let hash = 7;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const code = String((hash % 9000) + 1000);
  const teamSlug = team.trim().replace(/[^a-zA-Z0-9]+/g, "").slice(0, 8).toUpperCase() || "TEAM";
  return `#HH-GOA-${teamSlug}-${code}`;
}

function buildCardShareUrl(options: {
  mode: Mode;
  idDesign: IdDesign;
  builderName: string;
  team: string;
  stack: string;
  socialHandle?: string;
  memberNames?: string;
  imageUrl?: string;
}) {
  const who = (options.mode === "squad" ? options.team : options.builderName).trim() || "a builder";
  const id = shareBuilderId(who, options.team.trim() || "ShipSquad").replace(/^#/, "");
  const params = new URLSearchParams();
  params.set("id", id);
  if (options.imageUrl) params.set("img", options.imageUrl);
  params.set("m", options.mode);
  if (options.mode === "id") params.set("d", options.idDesign);
  if (options.builderName.trim()) params.set("n", options.builderName.trim());
  if (options.team.trim()) params.set("t", options.team.trim());
  if (options.stack.trim()) params.set("s", options.stack.trim());
  const handle = options.socialHandle?.trim().replace(/^@/, "");
  if (handle) params.set("h", handle);
  if (options.mode === "squad" && options.memberNames?.trim()) {
    params.set("members", options.memberNames.trim());
  }
  return `${SITE_URL}card?${params.toString()}`;
}

function buildShareCaption(options: {
  mode: Mode;
  idDesign: IdDesign;
  builderName: string;
  team: string;
  stack: string;
  socialHandle?: string;
  memberNames?: string;
  imageUrl?: string;
}) {
  const who = (options.mode === "squad" ? options.team : options.builderName).trim() || "a builder";
  const id = shareBuilderId(who, options.team.trim() || "ShipSquad");
  const cardUrl = buildCardShareUrl(options);
  return [
    "🌴 Built my HH Goa Builder Card!",
    "",
    `👤 ${who}`,
    `📇 Builder ID: ${id}`,
    "",
    "Excited to build, ship & connect in Goa 🚀",
    "",
    "My card:",
    cardUrl,
    "",
    "Create yours:",
    SITE_URL,
    "",
    "#FrameInGoa #HHGoa2026",
  ].join("\n");
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read card image."));
    reader.readAsDataURL(blob);
  });
}

function drawCoastalId(
  ctx: CanvasRenderingContext2D,
  photo: Photo | null | undefined,
  name: string,
  stack: string,
  teamName: string,
  socialHandle: string,
) {
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, ID_W, ID_H);

  // Soft floral wash
  for (let i = 0; i < 7; i++) {
    const x = 120 + i * 220;
    drawLeaf(ctx, x, 180 + (i % 2) * 40, 70, -0.4 + i * 0.08, "rgba(11,104,57,.06)");
    drawHibiscus(ctx, x + 80, ID_H - 90 - (i % 3) * 18, 28 + (i % 2) * 8, "rgba(255,0,128,.07)", "rgba(254,225,1,.08)");
  }

  drawFloralCorner(ctx, 18, 150, 1, 1);
  drawFloralCorner(ctx, ID_W - 18, 150, -1, 1);
  drawFloralCorner(ctx, 18, ID_H - 18, 1, -1);
  drawFloralCorner(ctx, ID_W - 18, ID_H - 18, -1, -1);

  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, ID_W, 118);
  ctx.fillStyle = COLORS.orange;
  ctx.fillRect(0, 118, 980, 18);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(980, 118, 620, 18);

  ctx.fillStyle = COLORS.white;
  ctx.textAlign = "left";
  ctx.font = `800 58px ${DISPLAY_FONT}`;
  ctx.fillText("HACKERS HOUSE", 56, 78);
  ctx.fillStyle = COLORS.lime;
  ctx.textAlign = "right";
  ctx.font = `800 42px ${DISPLAY_FONT}`;
  ctx.fillText("GOA / 2026", ID_W - 56, 74);
  ctx.textAlign = "left";

  const photoX = 56;
  const photoY = 178;
  const photoW = 620;
  const photoH = 620;
  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, 28);
  ctx.clip();
  if (photo) drawCover(ctx, photo, photoX, photoY, photoW, photoH);
  else drawNoPhoto(ctx, photoX, photoY, photoW, photoH);
  ctx.restore();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 8;
  roundRect(ctx, photoX, photoY, photoW, photoH, 28);
  ctx.stroke();

  const infoX = 726;
  ctx.fillStyle = COLORS.pink;
  roundRect(ctx, infoX, 178, 820, 72, 20);
  ctx.fill();
  ctx.fillStyle = COLORS.white;
  ctx.font = `700 30px ${MONO_FONT}`;
  ctx.fillText("BUILDER ID  /  026", infoX + 28, 224);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 20px ${MONO_FONT}`;
  ctx.fillText("BUILDER", infoX + 12, 310);
  ctx.fillStyle = COLORS.orange;
  fitText(ctx, name || "Your Name", 780, 70);
  ctx.fillText(name || "Your Name", infoX + 12, 372);
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(infoX + 12, 396, 760, 5);

  ctx.font = `700 20px ${MONO_FONT}`;
  ctx.fillText("STACK / ROLE", infoX + 12, 460);
  fitText(ctx, stack || "Design + Code", 760, 44, 800);
  ctx.fillText(stack || "Design + Code", infoX + 12, 512);

  ctx.font = `700 20px ${MONO_FONT}`;
  ctx.fillText("TEAM NAME", infoX + 12, 580);
  ctx.fillStyle = COLORS.sand;
  roundRect(ctx, infoX, 600, 520, socialHandle ? 86 : 110, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, infoX, 600, 520, socialHandle ? 86 : 110, 18);
  ctx.stroke();
  ctx.fillStyle = COLORS.ink;
  fitText(ctx, teamName || "Your Team", 460, socialHandle ? 38 : 44);
  ctx.fillText(teamName || "Your Team", infoX + 24, socialHandle ? 656 : 668);

  if (socialHandle) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 18px ${MONO_FONT}`;
    ctx.fillText("SOCIAL", infoX + 12, 730);
    ctx.fillStyle = COLORS.pink;
    fitText(ctx, socialHandle, 500, 36, 800);
    ctx.fillText(socialHandle, infoX + 12, 772);
  }

  drawStamp(ctx, 1420, 660, -0.05, 0.92);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `800 34px ${DISPLAY_FONT}`;
  ctx.fillText("BUILDERS, BEACHES, BIG IDEAS.", 56, 870);
  ctx.fillStyle = COLORS.orange;
  ctx.fillRect(56, 892, 1488, 12);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 18px ${MONO_FONT}`;
  ctx.fillText("#FRAMEINGOA", 56, 948);
  ctx.textAlign = "right";
  ctx.fillText("VALID FOR ONE UNFORGETTABLE BUILD", ID_W - 56, 948);
}

function drawHorizonId(
  ctx: CanvasRenderingContext2D,
  photo: Photo | null | undefined,
  name: string,
  stack: string,
  teamName: string,
  socialHandle: string,
) {
  // Clean cream canvas — readable first, scenery second
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, ID_W, ID_H);

  // Horizon header band
  const headerH = 168;
  const sky = ctx.createLinearGradient(0, 0, 0, headerH);
  sky.addColorStop(0, "#053821");
  sky.addColorStop(0.55, COLORS.deep);
  sky.addColorStop(1, COLORS.sea);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, ID_W, headerH);

  // Soft sun + glow (kept small so it never fights the title)
  ctx.fillStyle = "rgba(254,225,1,.22)";
  ctx.beginPath();
  ctx.arc(ID_W - 210, 78, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.orange;
  ctx.beginPath();
  ctx.arc(ID_W - 210, 78, 42, 0, Math.PI * 2);
  ctx.fill();

  // Gentle sea line under the sky
  ctx.fillStyle = "#0e7a44";
  ctx.fillRect(0, headerH - 34, ID_W, 34);
  ctx.strokeStyle = "rgba(255,251,232,.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= ID_W; x += 40) {
    const y = headerH - 18 + Math.sin(x * 0.04) * 5;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Cream wave edge into the body
  ctx.fillStyle = COLORS.cream;
  ctx.beginPath();
  ctx.moveTo(0, headerH - 8);
  for (let x = 0; x <= ID_W; x += 50) {
    ctx.quadraticCurveTo(x + 25, headerH + (x / 50 % 2 === 0 ? 10 : -6), x + 50, headerH - 8);
  }
  ctx.lineTo(ID_W, headerH + 24);
  ctx.lineTo(0, headerH + 24);
  ctx.closePath();
  ctx.fill();

  // Title on the dark band — high contrast
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.white;
  ctx.font = `800 52px ${DISPLAY_FONT}`;
  ctx.fillText("HACKERS HOUSE", 56, 78);
  ctx.fillStyle = COLORS.orange;
  ctx.font = `700 20px ${MONO_FONT}`;
  ctx.fillText("BUILDERS · BEACHES · BIG IDEAS", 58, 118);
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.cream;
  ctx.font = `800 36px ${DISPLAY_FONT}`;
  ctx.fillText("GOA / 2026", ID_W - 56, 88);

  // Quiet corner florals — low opacity, away from text
  drawHibiscus(ctx, 70, ID_H - 70, 26, "rgba(255,0,128,.18)", "rgba(254,225,1,.2)");
  drawHibiscus(ctx, ID_W - 70, ID_H - 78, 30, "rgba(254,225,1,.2)", "rgba(255,0,128,.18)");
  drawLeaf(ctx, 120, ID_H - 40, 40, -0.9, "rgba(11,104,57,.12)");
  drawLeaf(ctx, ID_W - 120, ID_H - 44, 38, 0.85, "rgba(11,104,57,.12)");
  drawPalmFrond(ctx, ID_W - 40, 210, 0.55, 0.55, "rgba(11,104,57,.14)");

  // Photo — left column
  const px = 56;
  const py = 214;
  const pw = 560;
  const ph = 620;
  ctx.fillStyle = COLORS.white;
  roundRect(ctx, px - 8, py - 8, pw + 16, ph + 16, 26);
  ctx.fill();
  ctx.save();
  roundRect(ctx, px, py, pw, ph, 20);
  ctx.clip();
  if (photo) drawCover(ctx, photo, px, py, pw, ph);
  else drawNoPhoto(ctx, px, py, pw, ph);
  ctx.restore();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 7;
  roundRect(ctx, px, py, pw, ph, 20);
  ctx.stroke();
  ctx.strokeStyle = COLORS.orange;
  ctx.lineWidth = 4;
  roundRect(ctx, px + 14, py + 14, pw - 28, ph - 28, 14);
  ctx.stroke();

  // Info — right column with airy spacing
  const ix = 680;
  const contentW = 860;

  ctx.fillStyle = COLORS.pink;
  roundRect(ctx, ix, 214, 300, 56, 16);
  ctx.fill();
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = "left";
  ctx.font = `700 24px ${MONO_FONT}`;
  ctx.fillText("BUILDER ID", ix + 28, 250);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 18px ${MONO_FONT}`;
  ctx.fillText("BUILDER", ix, 322);
  ctx.fillStyle = COLORS.deep;
  fitText(ctx, name || "Your Name", contentW - 40, 68);
  ctx.fillText(name || "Your Name", ix, 386);
  ctx.fillStyle = COLORS.orange;
  ctx.fillRect(ix, 408, Math.min(420, contentW * 0.55), 8);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 18px ${MONO_FONT}`;
  ctx.fillText("STACK / ROLE", ix, 470);
  ctx.fillStyle = COLORS.deep;
  fitText(ctx, stack || "Design + Code", contentW - 40, 44, 800);
  ctx.fillText(stack || "Design + Code", ix, 522);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 18px ${MONO_FONT}`;
  ctx.fillText("TEAM NAME", ix, 586);
  ctx.fillStyle = "#fff4b8";
  roundRect(ctx, ix, 606, 520, 78, 16);
  ctx.fill();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, ix, 606, 520, 78, 16);
  ctx.stroke();
  ctx.fillStyle = COLORS.deep;
  fitText(ctx, teamName || "Your Team", 470, 40);
  ctx.fillText(teamName || "Your Team", ix + 22, 656);

  if (socialHandle) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 18px ${MONO_FONT}`;
    ctx.fillText("SOCIAL", ix, 732);
    ctx.fillStyle = COLORS.pink;
    fitText(ctx, socialHandle, contentW - 80, 36, 800);
    ctx.fillText(socialHandle, ix, 776);
  } else {
    ctx.fillStyle = "rgba(11,104,57,.55)";
    ctx.font = `700 18px ${MONO_FONT}`;
    ctx.fillText("SHIP • SHARE • REPEAT", ix, 732);
  }

  // Compact stamp — clear of primary text
  drawStamp(ctx, 1410, 760, -0.04, 0.78);

  // Footer strip
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 900, ID_W, 100);
  ctx.fillStyle = COLORS.orange;
  ctx.fillRect(0, 900, ID_W, 8);
  ctx.fillStyle = COLORS.cream;
  ctx.font = `800 30px ${DISPLAY_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("GOA HORIZON  ·  HH GOA '26", 56, 952);
  ctx.font = `700 18px ${MONO_FONT}`;
  ctx.fillText("#FRAMEINGOA", 56, 984);
  ctx.textAlign = "right";
  ctx.fillText("VALID FOR ONE UNFORGETTABLE BUILD", ID_W - 56, 968);
}

function readSharedLaunch() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const sharedId = params.get("id");
  if (!sharedId) return null;

  const sharedMode = params.get("m");
  const mode: Mode | null =
    sharedMode === "id" || sharedMode === "pfp" || sharedMode === "squad" ? sharedMode : null;

  const sharedDesign = params.get("d");
  const idDesign: IdDesign | null =
    sharedDesign === "coastal" || sharedDesign === "horizon" ? sharedDesign : null;

  return {
    sharedId,
    mode,
    idDesign,
    name: params.get("n") || "",
    teamName: params.get("t") || "",
    stack: params.get("s") || "",
    socialHandle: params.get("h") || "",
    memberNames: params.get("members") || "",
  };
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadSlotRef = useRef<number | null>(null);
  const [sharedLaunch] = useState(readSharedLaunch);
  const [mode, setMode] = useState<Mode>(() => sharedLaunch?.mode ?? "id");
  const [idDesign, setIdDesign] = useState<IdDesign>(() => sharedLaunch?.idDesign ?? "coastal");
  const [photos, setPhotos] = useState<Array<Photo | null>>([]);
  const [name, setName] = useState(() => sharedLaunch?.name ?? "");
  const [stack, setStack] = useState(() => sharedLaunch?.stack ?? "");
  const [teamName, setTeamName] = useState(() => sharedLaunch?.teamName ?? "");
  const [socialHandle, setSocialHandle] = useState(() => sharedLaunch?.socialHandle ?? "");
  const [memberNames, setMemberNames] = useState(() => sharedLaunch?.memberNames ?? "");
  const [busy, setBusy] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState(() =>
    sharedLaunch ? `Shared Builder ID #${sharedLaunch.sharedId} loaded. Add a photo to finish this frame.` : "",
  );
  const [fontsReady, setFontsReady] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const outputSize = mode === "id" ? `${ID_W} × ${ID_H}` : `${SQ} × ${SQ}`;
  const displayHandle = formatHandle(socialHandle);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = mode === "id" ? ID_W : SQ;
    const height = mode === "id" ? ID_H : SQ;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.textBaseline = "alphabetic";

    if (mode === "pfp") {
      if (photos[0]) drawCover(ctx, photos[0], 0, 0, SQ, SQ);
      else drawNoPhoto(ctx, 0, 0, SQ, SQ);
      const shade = ctx.createLinearGradient(0, 580, 0, SQ);
      shade.addColorStop(0, "rgba(11,104,57,0)");
      shade.addColorStop(1, "rgba(11,104,57,.96)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 520, SQ, 560);
      ctx.strokeStyle = COLORS.orange;
      ctx.lineWidth = 42;
      ctx.strokeRect(21, 21, 1038, 1038);
      ctx.strokeStyle = COLORS.pink;
      ctx.lineWidth = 12;
      ctx.strokeRect(50, 50, 980, 980);
      ctx.fillStyle = COLORS.lime;
      ctx.fillRect(0, 0, 265, 30);
      ctx.fillRect(815, 1050, 265, 30);
      drawStamp(ctx, 855, 155, 0.08);
      ctx.textAlign = "left";
      ctx.fillStyle = COLORS.white;
      fitText(ctx, name || "Your Name", 870, 78);
      ctx.fillText((name || "Your Name").toUpperCase(), 74, 868);
      ctx.fillStyle = COLORS.orange;
      let stackSize = 32;
      const stackLabel = (stack || "Design + Code").toUpperCase();
      do {
        ctx.font = `700 ${stackSize}px ${MONO_FONT}`;
        if (ctx.measureText(stackLabel).width <= 920) break;
        stackSize -= 2;
      } while (stackSize > 18);
      ctx.fillText(stackLabel, 78, 918);
      ctx.fillStyle = COLORS.cyan;
      let pfpMetaSize = 24;
      const pfpMeta = displayHandle
        ? `${(teamName || "Your Team").toUpperCase()}  ·  ${displayHandle}  ·  #FRAMEINGOA`
        : `${(teamName || "Your Team").toUpperCase()}  ·  #FRAMEINGOA`;
      do {
        ctx.font = `700 ${pfpMetaSize}px ${MONO_FONT}`;
        if (ctx.measureText(pfpMeta).width <= 920) break;
        pfpMetaSize -= 2;
      } while (pfpMetaSize > 14);
      ctx.fillText(pfpMeta, 78, 968);
      ctx.fillStyle = COLORS.orange;
      ctx.fillRect(78, 990, 376, 12);
    }

    if (mode === "id") {
      const photo = photos[0];
      if (idDesign === "coastal") drawCoastalId(ctx, photo, name, stack, teamName, displayHandle);
      else drawHorizonId(ctx, photo, name, stack, teamName, displayHandle);
    }

    if (mode === "squad") {
      ctx.fillStyle = COLORS.ink;
      ctx.fillRect(0, 0, SQ, SQ);
      ctx.fillStyle = COLORS.orange;
      ctx.fillRect(0, 0, SQ, 150);
      ctx.fillStyle = COLORS.lime;
      ctx.beginPath();
      ctx.moveTo(700, 0);
      ctx.lineTo(SQ, 0);
      ctx.lineTo(SQ, 150);
      ctx.lineTo(800, 150);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.font = `700 24px ${MONO_FONT}`;
      ctx.fillText("HH GOA / 2026", 48, 46);
      ctx.fillStyle = COLORS.white;
      fitText(ctx, teamName || "The Ship Squad", 680, 58);
      ctx.fillText((teamName || "The Ship Squad").toUpperCase(), 46, 110);
      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = "right";
      ctx.font = `700 24px ${MONO_FONT}`;
      ctx.fillText("3 MINDS. 1 FRAME.", 1034, 86);
      ctx.textAlign = "left";

      // Three equal portrait panels — best fit for a 3-person squad on a square frame.
      const displayPhotos = photos.slice(0, SQUAD_SIZE);
      const names = memberNames.split(",").map((item) => item.trim()).filter(Boolean);
      const gap = 16;
      const sidePad = 42;
      const tileW = Math.floor((SQ - sidePad * 2 - gap * (SQUAD_SIZE - 1)) / SQUAD_SIZE);
      const tileH = 740;
      const tileY = 178;
      const accents = [COLORS.pink, COLORS.orange, COLORS.cyan];
      for (let i = 0; i < SQUAD_SIZE; i++) {
        const x = sidePad + i * (tileW + gap);
        const y = tileY;
        ctx.save();
        roundRect(ctx, x, y, tileW, tileH, 22);
        ctx.clip();
        const photo = displayPhotos[i];
        if (photo) drawCover(ctx, photo, x, y, tileW, tileH);
        else drawNoPhoto(ctx, x, y, tileW, tileH);
        const tileShade = ctx.createLinearGradient(0, y + tileH - 160, 0, y + tileH);
        tileShade.addColorStop(0, "rgba(11,104,57,0)");
        tileShade.addColorStop(1, "rgba(11,104,57,.95)");
        ctx.fillStyle = tileShade;
        ctx.fillRect(x, y + tileH - 170, tileW, 170);
        ctx.restore();
        ctx.strokeStyle = accents[i];
        ctx.lineWidth = 7;
        roundRect(ctx, x, y, tileW, tileH, 22);
        ctx.stroke();
        ctx.fillStyle = COLORS.orange;
        ctx.fillRect(x + 18, y + tileH - 58, Math.min(120, tileW - 36), 8);
        ctx.fillStyle = COLORS.white;
        fitText(ctx, names[i] || `Builder ${i + 1}`, tileW - 40, 32, 900);
        ctx.fillText(names[i] || `Builder ${i + 1}`, x + 18, y + tileH - 24);
      }
      ctx.fillStyle = COLORS.lime;
      roundRect(ctx, 42, 948, 996, 68, 18);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = "center";
      ctx.font = `700 26px ${MONO_FONT}`;
      ctx.fillText("WE CAME TO GOA TO SHIP  •  #FRAMEINGOA", 540, 992);
    }
  }, [mode, idDesign, photos, name, stack, teamName, memberNames, displayHandle, fontsReady]);

  async function fileToPhoto(file: File): Promise<Photo> {
    let source: Blob = file;
    if (/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
      source = Array.isArray(converted) ? converted[0] : converted;
    }
    const url = URL.createObjectURL(source);
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("We couldn’t read that image."));
      image.src = url;
    });
    let focusX = 0.5;
    let focusY = 0.43;
    try {
      const Detector = (window as typeof window & { FaceDetector?: new (options?: { fastMode?: boolean }) => { detect: (input: HTMLImageElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> } }).FaceDetector;
      if (Detector) {
        const faces = await new Detector({ fastMode: true }).detect(image);
        if (faces[0]) {
          focusX = (faces[0].boundingBox.x + faces[0].boundingBox.width / 2) / image.naturalWidth;
          focusY = (faces[0].boundingBox.y + faces[0].boundingBox.height / 2) / image.naturalHeight;
        }
      }
    } catch {
      // Smart centering is an enhancement; center crop remains a safe fallback.
    }
    return { image, name: file.name, focusX, focusY };
  }

  async function addFiles(files: FileList | File[], requestedSlot: number | null = null) {
    const selected = Array.from(files).slice(0, mode === "squad" ? SQUAD_SIZE : 1);
    if (!selected.length) return;
    setBusy(true);
    setNotice("");
    try {
      const loaded = await Promise.all(selected.map(fileToPhoto));
      if (mode !== "squad") {
        setPhotos((current) => {
          const previous = current[0];
          if (previous) URL.revokeObjectURL(previous.image.src);
          return [loaded[0]];
        });
      } else {
        setPhotos((current) => {
          const next: Array<Photo | null> = Array.from({ length: SQUAD_SIZE }, (_, index) => current[index] ?? null);
          let nextSlot = requestedSlot ?? next.findIndex((photo) => !photo);
          if (nextSlot < 0) nextSlot = 0;
          loaded.forEach((photo) => {
            if (nextSlot >= SQUAD_SIZE) return;
            const replaced = next[nextSlot];
            if (replaced) URL.revokeObjectURL(replaced.image.src);
            next[nextSlot] = photo;
            const followingEmpty = next.findIndex((item, index) => index > nextSlot && !item);
            nextSlot = followingEmpty >= 0 ? followingEmpty : SQUAD_SIZE;
          });
          return next;
        });
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Try a JPG, PNG, WebP, or HEIC photo.");
    } finally {
      setBusy(false);
    }
  }

  function selectMode(next: Mode) {
    setMode(next);
    setPhotos([]);
    setNotice("");
    uploadSlotRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }

  function chooseSquadSlot(slot: number) {
    uploadSlotRef.current = slot;
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  function chooseSinglePhoto() {
    uploadSlotRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  function removeSinglePhoto() {
    setPhotos((current) => {
      const photo = current[0];
      if (photo) URL.revokeObjectURL(photo.image.src);
      return [];
    });
    if (inputRef.current) inputRef.current.value = "";
    setNotice("Photo removed. Choose another whenever you’re ready.");
  }

  function removeSquadPhoto(slot: number) {
    setPhotos((current) => {
      const next = [...current];
      const removed = next[slot];
      if (removed) URL.revokeObjectURL(removed.image.src);
      next[slot] = null;
      return next;
    });
    uploadSlotRef.current = slot;
    setNotice(`Frame ${slot + 1} is empty and ready for another photo.`);
  }

  async function canvasBlob() {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Your frame is not ready yet.");
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export image."))), "image/png"),
    );
  }

  function missingDetailsMessage() {
    if (mode === "squad") {
      if (!photos.some(Boolean)) return "Upload at least one squad photo before continuing.";
      if (!teamName.trim()) return "Enter your squad name before continuing.";
      if (!memberNames.trim()) return "Add member names before continuing.";
      return "";
    }
    if (!photos[0]) return "Upload your photo before continuing.";
    if (!name.trim()) return "Enter your name before continuing.";
    if (!stack.trim()) return "Enter your stack / role before continuing.";
    if (!teamName.trim()) return "Enter your team name before continuing.";
    return "";
  }

  function requireDetails() {
    const message = missingDetailsMessage();
    if (!message) return true;
    setPopupMessage(message);
    return false;
  }

  async function download() {
    if (!requireDetails()) return;
    const blob = await canvasBlob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const designTag = mode === "id" ? `-${idDesign}` : "";
    link.download = `hh-goa-${mode}${designTag}-${(name || teamName || "builder").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setNotice("Your frame is downloaded. Goa looks good on you.");
  }

  async function share() {
    if (!requireDetails()) return;

    // Keep a real window handle from the user gesture. Do not use "noopener" here —
    // it makes window.open() return null, so X can never be redirected after upload.
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      setPopupMessage("Your browser blocked the X window. Allow popups for this site, then try Share to X again.");
      return;
    }

    try {
      popup.document.write(
        "<!doctype html><title>Sharing…</title><body style=\"margin:0;min-height:100vh;display:grid;place-items:center;background:#fffbe8;color:#0b6839;font-family:monospace;padding:24px;text-align:center\"><div><p style=\"font-size:18px;font-weight:700\">Publishing your HH Goa card…</p><p>X will open next.</p></div></body>",
      );
      popup.document.close();
    } catch {
      // Some browsers lock document writes; redirect still works afterward.
    }

    setSharing(true);
    setNotice("Publishing your card link…");

    const shareOptions = {
      mode,
      idDesign,
      builderName: name || "Your Name",
      team: teamName || "The Ship Squad",
      stack: stack || "Design + Code",
      socialHandle,
      memberNames,
    };

    let imageUrl: string | undefined;
    try {
      const blob = await canvasBlob();
      const who = (mode === "squad" ? teamName : name).trim() || "a builder";
      const id = shareBuilderId(who, teamName.trim() || "ShipSquad").replace(/^#/, "");

      try {
        const dataUrl = await blobToDataUrl(blob);
        window.localStorage.setItem(`hh-goa-card:${id}`, dataUrl);
      } catch {
        // localStorage may be full or blocked.
      }

      const form = new FormData();
      form.append("file", blob, `hh-goa-${id}.png`);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch("/api/share-card", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
        const payload = (await response.json()) as { url?: string };
        if (response.ok && payload.url) imageUrl = payload.url;
      } finally {
        window.clearTimeout(timeout);
      }
    } catch {
      // Still open X even if publishing the image fails.
    }

    const text = buildShareCaption({ ...shareOptions, imageUrl });
    const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;

    try {
      popup.location.href = xUrl;
      setNotice(
        imageUrl
          ? "X is open with your draft — card link opens your generated ID."
          : "X is open with your draft. Card image hosting was skipped; the link still works on this device.",
      );
    } catch {
      popup.close();
      setPopupMessage("Could not open X. Allow popups and try again.");
      setNotice("");
    } finally {
      setSharing(false);
    }
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    void addFiles(event.dataTransfer.files);
  }

  const activeDesign = ID_DESIGNS.find((design) => design.id === idDesign) ?? ID_DESIGNS[0];

  return (
    <main>
      <div className="floral-layer" aria-hidden="true">
        <span className="floral floral-a" />
        <span className="floral floral-b" />
        <span className="floral floral-c" />
        <span className="floral floral-d" />
        <span className="floral floral-e" />
        <span className="leaf leaf-a" />
        <span className="leaf leaf-b" />
        <span className="leaf leaf-c" />
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Frame in Goa home">
          <span className="brand-mark">HH</span>
          <span>FRAME IN GOA</span>
        </a>
        <a className="radar-link" href="#how-it-works">HOW IT WORKS <span>↘</span></a>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span>●</span> HH GOA 2026 / BUILDER EDITION</div>
        <h1>YOUR BUILD.<br /><em>YOUR FRAME.</em></h1>
        <p>Turn any photo into an unmistakably Goa builder badge. No crop anxiety. No signup. Just upload, download, and hit the Radar.</p>
        <div className="ticker" aria-hidden="true">
          <span>BUILDERS → BEACHES → BIG IDEAS →</span>
          <span>BUILDERS → BEACHES → BIG IDEAS →</span>
        </div>
      </section>

      <section className="studio" aria-label="Frame generator">
        <div className="controls-panel">
          <div className="step-heading"><span>01</span><div><small>PICK YOUR FORMAT</small><strong>How are you showing up?</strong></div></div>
          <div className="mode-tabs" role="tablist" aria-label="Frame format">
            {(["id", "pfp", "squad"] as Mode[]).map((item) => (
              <button key={item} role="tab" aria-selected={mode === item} className={mode === item ? "active" : ""} onClick={() => selectMode(item)}>
                {item === "id" ? "Builder ID" : item === "pfp" ? "PFP Frame" : "Squad Frame"}
              </button>
            ))}
          </div>

          {mode === "id" && (
            <label className="design-picker">
              <span>Card design</span>
              <select value={idDesign} onChange={(event) => setIdDesign(event.target.value as IdDesign)} aria-label="Choose Builder ID design">
                {ID_DESIGNS.map((design) => (
                  <option key={design.id} value={design.id}>{design.label}</option>
                ))}
              </select>
              <small>{activeDesign.blurb}</small>
            </label>
          )}

          <div className="step-heading second"><span>02</span><div><small>ADD THE HUMANS</small><strong>{mode === "squad" ? "Upload up to three photos" : "Drop in your best photo"}</strong></div></div>
          {mode === "squad" ? (
            <div className="squad-slots" aria-label="Squad photo slots">
              {Array.from({ length: SQUAD_SIZE }, (_, slot) => {
                const photo = photos[slot];
                return (
                  <div className={`squad-slot ${photo ? "filled" : ""}`} key={slot}>
                    <button type="button" className="slot-upload" onClick={() => chooseSquadSlot(slot)} aria-label={`${photo ? "Replace" : "Upload"} photo in frame ${slot + 1}`}>
                      {photo ? (
                        // The preview is a local blob URL, so Next Image optimization does not apply.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.image.src} alt="" />
                      ) : (
                        <span className="slot-empty"><b>+</b><small>FRAME {slot + 1}</small></span>
                      )}
                      <span className="slot-action">{photo ? "Replace" : "Upload"}</span>
                    </button>
                    {photo && <button type="button" className="slot-remove" onClick={() => removeSquadPhoto(slot)} aria-label={`Remove photo from frame ${slot + 1}`}>×</button>}
                  </div>
                );
              })}
              <p>{busy ? "Adding your builder…" : `${photos.filter(Boolean).length}/${SQUAD_SIZE} frames filled • choose any frame`}</p>
              {photos.filter(Boolean).length < SQUAD_SIZE && (
                <button type="button" className="next-upload" onClick={() => {
                  const nextEmpty = Array.from({ length: SQUAD_SIZE }, (_, index) => photos[index] ?? null).findIndex((photo) => !photo);
                  chooseSquadSlot(nextEmpty >= 0 ? nextEmpty : 0);
                }}>
                  + Add photo to next empty frame
                </button>
              )}
            </div>
          ) : (
            photos[0] ? (
              <div className="single-photo-slot">
                {/* Local blob previews cannot use Next Image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[0].image.src} alt="Current upload" />
                <div className="single-photo-actions">
                  <button type="button" className="replace-photo" onClick={chooseSinglePhoto}>↻ Replace photo</button>
                  <button type="button" className="remove-photo" onClick={removeSinglePhoto}>× Remove</button>
                </div>
                <small>Smart crop is applied automatically in the final frame.</small>
              </div>
            ) : (
              <button
                type="button"
                className={`drop-zone ${dragging ? "dragging" : ""}`}
                onClick={chooseSinglePhoto}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <span className="upload-icon">↥</span>
                <strong>{busy ? "Making room on the badge…" : "Tap to choose a photo"}</strong>
                <small>JPG, PNG, WebP or iPhone HEIC • smart crop included</small>
              </button>
            )
          )}
          <input ref={inputRef} className="visually-hidden" type="file" accept="image/*,.heic,.heif" multiple={mode === "squad"} onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) void addFiles(event.target.files, mode === "squad" ? uploadSlotRef.current : null);
          }} />

          <div className="fields">
            {mode === "squad" ? (
              <>
                <label>Squad name<input maxLength={28} value={teamName} placeholder="The Ship Squad" onChange={(event) => setTeamName(event.target.value)} /></label>
                <label>Names, separated by commas<input value={memberNames} placeholder="Builder One, Builder Two, Builder Three" onChange={(event) => setMemberNames(event.target.value)} /></label>
              </>
            ) : (
              <>
                <label>Your name<input maxLength={26} value={name} placeholder="Your Name" onFocus={(event) => event.currentTarget.select()} onChange={(event) => setName(event.target.value)} /></label>
                <label>Your stack / role<input maxLength={28} value={stack} placeholder="Design + Code" onFocus={(event) => event.currentTarget.select()} onChange={(event) => setStack(event.target.value)} /></label>
                <label className="generated-field">
                  <span>TEAM NAME</span>
                  <input
                    maxLength={28}
                    value={teamName}
                    placeholder="The Ship Squad"
                    onFocus={(event) => event.currentTarget.select()}
                    onChange={(event) => setTeamName(event.target.value)}
                    aria-label="Team name"
                  />
                </label>
                <label className="generated-field optional-field">
                  <span>SOCIAL HANDLE <em>(optional)</em></span>
                  <input
                    maxLength={24}
                    value={socialHandle}
                    placeholder="@yourhandle"
                    onChange={(event) => setSocialHandle(event.target.value)}
                    aria-label="Social handle (optional)"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-heading"><div><span>LIVE OUTPUT</span><strong>Ready for the Radar</strong></div><span className="status"><i /> {outputSize} PNG</span></div>
          <div className={`canvas-shell ${mode === "id" ? "landscape" : ""}`}><canvas ref={canvasRef} aria-label="Your generated HH Goa frame preview" /></div>
          <div className="actions">
            <button className="download" type="button" onClick={() => void download()}><span>↓</span> Download PNG</button>
            <button className="share" type="button" onClick={() => void share()} disabled={sharing}>
              <span>𝕏</span> {sharing ? "Publishing…" : "Share to X"}
            </button>
          </div>
          <p className="notice" aria-live="polite">{notice || "One click. One frame. Your shot at the exclusive HH Goa ID."}</p>
        </div>
      </section>

      {popupMessage && (
        <div className="popup-backdrop">
          <button
            type="button"
            className="popup-backdrop-dismiss"
            aria-label="Close dialog"
            onClick={() => setPopupMessage("")}
          />
          <div
            className="popup-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="details-popup-title"
            aria-describedby="details-popup-message"
          >
            <p id="details-popup-title">Fill your details first</p>
            <p id="details-popup-message">{popupMessage}</p>
            <button type="button" onClick={() => setPopupMessage("")}>Got it</button>
          </div>
        </div>
      )}

      <section className="how" id="how-it-works">
        <div><span>01</span><strong>DROP IT</strong><p>Any photo. Any shape. Smart framing handles the crop.</p></div>
        <div><span>02</span><strong>MAKE IT YOURS</strong><p>Pick a design, add your name, team, and optional social handle.</p></div>
        <div><span>03</span><strong>HIT THE RADAR</strong><p>Download or share straight to X with <b>#FrameInGoa</b>.</p></div>
      </section>

      <footer><strong>HH GOA / 2026</strong><span>BUILT FOR BUILDERS WHO SHIP.</span><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
