"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function readLocalCard(id: string) {
  if (!id || typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(`hh-goa-card:${id}`) || "";
  } catch {
    return "";
  }
}

function CardView() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  const remoteImg = params.get("img") || "";
  const builderName = params.get("n") || "";
  const teamName = params.get("t") || "";
  const [localSrc, setLocalSrc] = useState("");
  const [failed, setFailed] = useState(false);
  const src = remoteImg || localSrc;

  useEffect(() => {
    if (remoteImg || !id) return;
    const frame = window.requestAnimationFrame(() => {
      setLocalSrc(readLocalCard(id));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [id, remoteImg]);

  return (
    <main className="card-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Frame in Goa home">
          <span className="brand-mark">HH</span>
          <span>FRAME IN GOA</span>
        </Link>
        <Link className="radar-link" href="/">CREATE YOURS <span>↗</span></Link>
      </header>

      <section className="card-hero">
        <div className="eyebrow"><span>●</span> HH GOA 2026 / SHARED BUILDER CARD</div>
        <h1>{builderName || "Builder Card"}</h1>
        <p>
          {id ? <>Builder ID <strong>#{id}</strong></> : "Shared HH Goa frame"}
          {teamName ? <> · {teamName}</> : null}
        </p>
      </section>

      <section className="card-stage">
        {src && !failed ? (
          // Shared card images are remote/local data URLs; Next Image optimization does not apply.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={builderName ? `${builderName}'s HH Goa builder card` : "HH Goa builder card"}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="card-missing">
            <strong>This card image is unavailable.</strong>
            <p>It may have expired, or this link was opened on a different device. Create your own frame in seconds.</p>
            <Link href="/">Make your Builder Card</Link>
          </div>
        )}
      </section>

      <section className="card-cta">
        <Link href="/">Build your own HH Goa frame →</Link>
      </section>
    </main>
  );
}

export default function CardClient() {
  return (
    <Suspense fallback={<main className="card-page"><p className="card-loading">Loading builder card…</p></main>}>
      <CardView />
    </Suspense>
  );
}
