"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";

type Mode = "id" | "pfp" | "squad";
type Photo = { image: HTMLImageElement; name: string; focusX: number; focusY: number };

const TITLES = [
  "Midnight Shipper",
  "Pixel Pathfinder",
  "API Alchemist",
  "Bug Whisperer",
  "Zero-to-One Builder",
  "Prototype Pirate",
  "Signal Architect",
  "Weekend Worldbuilder",
];

const COLORS = {
  ink: "#11102b",
  cream: "#fff7e6",
  orange: "#ff6332",
  pink: "#ff4c9a",
  lime: "#d8ff3e",
  cyan: "#51dcff",
  white: "#ffffff",
};

function hash(value: string) {
  return [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
}

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
    ctx.font = `${weight} ${size}px Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  } while (size > 28);
  return size;
}

function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number, rotation = -0.08) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = COLORS.lime;
  roundRect(ctx, -130, -52, 260, 104, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 37px Arial, sans-serif";
  ctx.fillText("HH GOA '26", 0, -9);
  ctx.font = "700 17px Arial, sans-serif";
  ctx.fillText("SHIP • SHARE • REPEAT", 0, 28);
  ctx.restore();
}

function drawNoPhoto(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  gradient.addColorStop(0, "#272159");
  gradient.addColorStop(1, "#14122f");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.lineWidth = 3;
  for (let i = -h; i < w; i += 56) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.textAlign = "center";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillText("YOUR PHOTO LANDS HERE", x + w / 2, y + h / 2);
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("id");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [name, setName] = useState("Your Name");
  const [stack, setStack] = useState("Design + Code");
  const [teamName, setTeamName] = useState("The Ship Squad");
  const [memberNames, setMemberNames] = useState("Builder One, Builder Two, Builder Three, Builder Four");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");

  const builderTitle = useMemo(() => {
    const seed = `${name.trim()}-${stack.trim()}`;
    return TITLES[hash(seed) % TITLES.length];
  }, [name, stack]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;
    ctx.clearRect(0, 0, 1080, 1080);
    ctx.textBaseline = "alphabetic";

    if (mode === "pfp") {
      if (photos[0]) drawCover(ctx, photos[0], 0, 0, 1080, 1080);
      else drawNoPhoto(ctx, 0, 0, 1080, 1080);
      const shade = ctx.createLinearGradient(0, 580, 0, 1080);
      shade.addColorStop(0, "rgba(17,16,43,0)");
      shade.addColorStop(1, "rgba(17,16,43,.94)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 520, 1080, 560);
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
      fitText(ctx, name || "Your Name", 870, 90);
      ctx.fillText((name || "Your Name").toUpperCase(), 74, 894);
      ctx.fillStyle = COLORS.cyan;
      ctx.font = "800 34px Arial, sans-serif";
      ctx.fillText(`${builderTitle.toUpperCase()}  /  #FRAMEINGOA`, 78, 953);
      ctx.fillStyle = COLORS.orange;
      ctx.fillRect(78, 984, 376, 14);
    }

    if (mode === "id") {
      ctx.fillStyle = COLORS.cream;
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.fillStyle = COLORS.ink;
      ctx.fillRect(0, 0, 1080, 138);
      ctx.fillStyle = COLORS.orange;
      ctx.fillRect(0, 138, 664, 24);
      ctx.fillStyle = COLORS.pink;
      ctx.fillRect(664, 138, 416, 24);
      ctx.fillStyle = COLORS.white;
      ctx.font = "900 48px Arial, sans-serif";
      ctx.fillText("HACKERS HOUSE", 58, 88);
      ctx.fillStyle = COLORS.lime;
      ctx.textAlign = "right";
      ctx.font = "900 35px Arial, sans-serif";
      ctx.fillText("GOA / 2026", 1024, 84);
      ctx.textAlign = "left";

      ctx.save();
      roundRect(ctx, 58, 210, 520, 688, 36);
      ctx.clip();
      if (photos[0]) drawCover(ctx, photos[0], 58, 210, 520, 688);
      else drawNoPhoto(ctx, 58, 210, 520, 688);
      ctx.restore();
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 8;
      roundRect(ctx, 58, 210, 520, 688, 36);
      ctx.stroke();

      ctx.fillStyle = COLORS.pink;
      roundRect(ctx, 604, 218, 420, 82, 22);
      ctx.fill();
      ctx.fillStyle = COLORS.white;
      ctx.font = "900 31px Arial, sans-serif";
      ctx.fillText("BUILDER ID  /  026", 630, 270);

      ctx.fillStyle = COLORS.ink;
      ctx.font = "700 23px Arial, sans-serif";
      ctx.fillText("BUILDER", 616, 373);
      ctx.fillStyle = COLORS.orange;
      fitText(ctx, name || "Your Name", 396, 64);
      ctx.fillText(name || "Your Name", 616, 435);
      ctx.fillStyle = COLORS.ink;
      ctx.fillRect(616, 462, 390, 5);

      ctx.font = "700 23px Arial, sans-serif";
      ctx.fillText("STACK / ROLE", 616, 526);
      ctx.fillStyle = COLORS.ink;
      fitText(ctx, stack || "Design + Code", 392, 42, 800);
      ctx.fillText(stack || "Design + Code", 616, 578);

      ctx.fillStyle = COLORS.ink;
      ctx.font = "700 23px Arial, sans-serif";
      ctx.fillText("BUILDER CLASS", 616, 661);
      ctx.fillStyle = COLORS.cyan;
      roundRect(ctx, 604, 684, 420, 125, 22);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      fitText(ctx, builderTitle, 372, 42);
      ctx.fillText(builderTitle, 630, 756);

      drawStamp(ctx, 806, 877, -0.04);
      ctx.fillStyle = COLORS.ink;
      ctx.font = "900 30px Arial, sans-serif";
      ctx.fillText("BUILDERS, BEACHES, BIG IDEAS.", 58, 978);
      ctx.fillStyle = COLORS.orange;
      ctx.fillRect(58, 1004, 950, 15);
      ctx.fillStyle = COLORS.ink;
      ctx.font = "700 18px Arial, sans-serif";
      ctx.fillText("#FRAMEINGOA", 58, 1050);
      ctx.textAlign = "right";
      ctx.fillText("VALID FOR ONE UNFORGETTABLE BUILD", 1022, 1050);
    }

    if (mode === "squad") {
      ctx.fillStyle = COLORS.ink;
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.fillStyle = COLORS.orange;
      ctx.fillRect(0, 0, 1080, 168);
      ctx.fillStyle = COLORS.lime;
      ctx.beginPath();
      ctx.moveTo(720, 0);
      ctx.lineTo(1080, 0);
      ctx.lineTo(1080, 168);
      ctx.lineTo(820, 168);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.font = "900 27px Arial, sans-serif";
      ctx.fillText("HH GOA / 2026", 56, 52);
      ctx.fillStyle = COLORS.white;
      fitText(ctx, teamName || "The Ship Squad", 700, 68);
      ctx.fillText((teamName || "The Ship Squad").toUpperCase(), 54, 125);
      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = "right";
      ctx.font = "900 26px Arial, sans-serif";
      ctx.fillText("4 MINDS. 1 FRAME.", 1032, 94);
      ctx.textAlign = "left";

      const displayPhotos = photos.slice(0, 4);
      const count = Math.max(displayPhotos.length, 4);
      const names = memberNames.split(",").map((item) => item.trim()).filter(Boolean);
      const gap = 14;
      const tileW = 479;
      const tileH = 372;
      for (let i = 0; i < count && i < 4; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 54 + col * (tileW + gap);
        const y = 200 + row * (tileH + gap);
        ctx.save();
        roundRect(ctx, x, y, tileW, tileH, 24);
        ctx.clip();
        if (displayPhotos[i]) drawCover(ctx, displayPhotos[i], x, y, tileW, tileH);
        else drawNoPhoto(ctx, x, y, tileW, tileH);
        const tileShade = ctx.createLinearGradient(0, y + tileH - 125, 0, y + tileH);
        tileShade.addColorStop(0, "rgba(17,16,43,0)");
        tileShade.addColorStop(1, "rgba(17,16,43,.92)");
        ctx.fillStyle = tileShade;
        ctx.fillRect(x, y + tileH - 130, tileW, 130);
        ctx.restore();
        ctx.strokeStyle = i % 2 === 0 ? COLORS.pink : COLORS.cyan;
        ctx.lineWidth = 7;
        roundRect(ctx, x, y, tileW, tileH, 24);
        ctx.stroke();
        ctx.fillStyle = COLORS.white;
        fitText(ctx, names[i] || `Builder ${i + 1}`, tileW - 56, 34, 900);
        ctx.fillText(names[i] || `Builder ${i + 1}`, x + 24, y + tileH - 26);
      }
      ctx.fillStyle = COLORS.lime;
      roundRect(ctx, 54, 974, 972, 62, 18);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = "center";
      ctx.font = "900 28px Arial, sans-serif";
      ctx.fillText("WE CAME TO GOA TO SHIP  •  #FRAMEINGOA", 540, 1015);
    }
  }, [mode, photos, name, stack, teamName, memberNames, builderTitle]);

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

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files).slice(0, mode === "squad" ? 4 : 1);
    if (!selected.length) return;
    setBusy(true);
    setNotice("");
    try {
      const loaded = await Promise.all(selected.map(fileToPhoto));
      setPhotos(loaded);
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
    if (inputRef.current) inputRef.current.value = "";
  }

  async function canvasBlob() {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Your frame is not ready yet.");
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export image."))), "image/png"),
    );
  }

  async function download() {
    const blob = await canvasBlob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `hh-goa-${mode}-${(name || teamName || "builder").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setNotice("Your frame is downloaded. Goa looks good on you.");
  }

  async function share() {
    const blob = await canvasBlob();
    const file = new File([blob], "hh-goa-frame.png", { type: "image/png" });
    const subject = mode === "squad" ? teamName : name;
    const text = `Meet ${subject || "the builders"} — shipping big ideas at HH Goa 2026. Make yours in seconds. #FrameInGoa`;
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ text, files: [file] });
        setNotice("Frame shared — see you on the Radar.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await download();
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setNotice("Your image is downloaded. Attach it to the pre-filled X post.");
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    void addFiles(event.dataTransfer.files);
  }

  return (
    <main>
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

          <div className="step-heading second"><span>02</span><div><small>ADD THE HUMANS</small><strong>{mode === "squad" ? "Upload up to four photos" : "Drop in your best photo"}</strong></div></div>
          <button
            type="button"
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <span className="upload-icon">↥</span>
            <strong>{busy ? "Making room on the badge…" : photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""} ready` : "Tap to choose photos"}</strong>
            <small>JPG, PNG, WebP or iPhone HEIC • smart crop included</small>
          </button>
          <input ref={inputRef} className="visually-hidden" type="file" accept="image/*,.heic,.heif" multiple={mode === "squad"} onChange={(event: ChangeEvent<HTMLInputElement>) => event.target.files && void addFiles(event.target.files)} />

          <div className="fields">
            {mode === "squad" ? (
              <>
                <label>Squad name<input maxLength={28} value={teamName} onChange={(event) => setTeamName(event.target.value)} /></label>
                <label>Names, separated by commas<input value={memberNames} onChange={(event) => setMemberNames(event.target.value)} /></label>
              </>
            ) : (
              <>
                <label>Your name<input maxLength={26} value={name} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setName(event.target.value)} /></label>
                <label>Your stack / role<input maxLength={28} value={stack} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setStack(event.target.value)} /></label>
                <div className="generated-field"><span>Generated builder class</span><strong>{builderTitle}</strong><button type="button" onClick={() => setName((current) => `${current} `)} aria-label="Generate a different builder class">↻</button></div>
              </>
            )}
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-heading"><div><span>LIVE OUTPUT</span><strong>Ready for the Radar</strong></div><span className="status"><i /> 1080 × 1080 PNG</span></div>
          <div className="canvas-shell"><canvas ref={canvasRef} aria-label="Your generated HH Goa frame preview" /></div>
          <div className="actions">
            <button className="download" type="button" onClick={() => void download()}><span>↓</span> Download PNG</button>
            <button className="share" type="button" onClick={() => void share()}><span>𝕏</span> Share to X</button>
          </div>
          <p className="notice" aria-live="polite">{notice || "One click. One frame. Your shot at the exclusive HH Goa ID."}</p>
        </div>
      </section>

      <section className="how" id="how-it-works">
        <div><span>01</span><strong>DROP IT</strong><p>Any photo. Any shape. Smart framing handles the crop.</p></div>
        <div><span>02</span><strong>MAKE IT YOURS</strong><p>Add your name and stack. We generate your builder class.</p></div>
        <div><span>03</span><strong>HIT THE RADAR</strong><p>Download or share straight to X with <b>#FrameInGoa</b>.</p></div>
      </section>

      <footer><strong>HH GOA / 2026</strong><span>BUILT FOR BUILDERS WHO SHIP.</span><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
