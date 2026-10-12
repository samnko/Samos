import { NextResponse } from "next/server";

// Sends contact requests by email through Resend when configured on Vercel:
//   RESEND_API_KEY, CONTACT_TO_EMAIL, (optional) CONTACT_FROM_EMAIL
// Without them the client falls back to WhatsApp with the request pre-filled, so no lead is lost.

const clean = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (clean(body.company)) return NextResponse.json({ ok: true }); // honeypot

  const data = {
    name: clean(body.name, 120),
    phone: clean(body.phone, 40),
    email: clean(body.email, 160),
    type: clean(body.type, 20),
    budget: clean(body.budget, 80),
    message: clean(body.message),
    lang: clean(body.lang, 5),
  };
  if (!data.name || !data.phone) return NextResponse.json({ error: "missing" }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return NextResponse.json({ fallback: true }, { status: 503 });

  const rows = Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#625e57">${k}</td><td>${escape(v)}</td></tr>`)
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Cohen Real Estate <onboarding@resend.dev>",
      to: [to],
      reply_to: data.email || undefined,
      subject: `Nouveau contact (${data.type}) : ${data.name}`,
      html: `<table style="font-family:sans-serif;font-size:14px">${rows}</table>`,
    }),
  });

  if (!res.ok) return NextResponse.json({ fallback: true }, { status: 502 });
  return NextResponse.json({ ok: true });
}
