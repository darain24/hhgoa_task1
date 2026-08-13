import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function toDirectTmpfilesUrl(pageUrl: string) {
  const secure = pageUrl.replace(/^http:\/\//i, "https://");
  return secure.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

async function uploadToTmpfiles(file: File) {
  const upload = new FormData();
  upload.append("file", file, file.name || "hh-goa-card.png");
  const response = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: upload,
  });
  if (!response.ok) throw new Error("tmpfiles upload failed");
  const payload = (await response.json()) as { data?: { url?: string } };
  if (!payload.data?.url) throw new Error("tmpfiles returned no URL");
  return toDirectTmpfilesUrl(payload.data.url);
}

async function uploadTo0x0(file: File) {
  const upload = new FormData();
  upload.append("file", file, file.name || "hh-goa-card.png");
  const response = await fetch("https://0x0.st", {
    method: "POST",
    body: upload,
  });
  const url = (await response.text()).trim();
  if (!response.ok || !/^https?:\/\//i.test(url)) throw new Error("0x0 upload failed");
  return url;
}

export async function POST(request: NextRequest) {
  try {
    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing card image." }, { status: 400 });
    }

    try {
      const url = await uploadToTmpfiles(file);
      return NextResponse.json({ url });
    } catch {
      const url = await uploadTo0x0(file);
      return NextResponse.json({ url });
    }
  } catch {
    return NextResponse.json({ error: "Could not publish your card image. Try again." }, { status: 500 });
  }
}
