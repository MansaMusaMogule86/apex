import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTENT_VALUES = [
  "intelligence_os",
  "deal_flow",
  "influence",
  "advisory",
] as const;

const ApplicationSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(160),
  title: z.string().trim().max(160).optional().nullable(),
  company: z.string().trim().min(1, "Company is required").max(200),
  market: z.string().trim().max(80).optional().nullable(),
  aum_range: z.string().trim().max(80).optional().nullable(),
  email: z.string().trim().toLowerCase().email("Valid email required").max(200),
  intent_type: z.enum(INTENT_VALUES),
  problem_statement: z.string().trim().max(4000).optional().nullable(),
  signal_score: z.number().int().min(0).max(100).optional().nullable(),
  linkedin_url: z.string().trim().url().max(300).optional().nullable().or(z.literal("")),
  website_url: z.string().trim().url().max(300).optional().nullable().or(z.literal("")),
  referral_source: z.string().trim().max(120).optional().nullable(),
  referral_code: z.string().trim().max(40).optional().nullable(),
  phantom_scan_authorized: z.boolean().optional().default(false),
  osint_score: z.number().int().min(0).max(100).optional().nullable(),
});

function generateRefCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `APEX-${n}`;
}

function nullify<T extends string | null | undefined>(v: T): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
}

async function sendEmails(payload: {
  refCode: string;
  email: string;
  fullName: string;
  company: string;
  intentType: string;
  fields: Record<string, unknown>;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "APEX <access@apex.intelligence>";

  const applicantHtml = `
<!doctype html><html><body style="margin:0;padding:0;background:#080808;color:#e8e0d0;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 24px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#0c0c0c;border:1px solid rgba(200,169,110,0.18);border-radius:4px;padding:36px;">
      <tr><td style="font-family:Georgia,'Times New Roman',serif;color:#c8a96e;font-size:22px;letter-spacing:0.3em;">APEX</td></tr>
      <tr><td style="padding-top:28px;font-size:13px;line-height:1.7;color:#bdb39e;">
        ${escape(payload.fullName)},<br/><br/>
        Your request for private access has been received and entered into the APEX screening queue.
        A private intelligence brief is being compiled. Expect contact via this registered email within 24 hours.
      </td></tr>
      <tr><td style="padding-top:28px;">
        <span style="display:inline-block;font-family:'Courier New',monospace;color:#c8a96e;font-size:12px;letter-spacing:0.15em;border:1px solid rgba(200,169,110,0.4);background:rgba(200,169,110,0.06);padding:10px 22px;border-radius:3px;">
          REF — ${payload.refCode}
        </span>
      </td></tr>
      <tr><td style="padding-top:32px;font-family:'Courier New',monospace;color:rgba(200,169,110,0.45);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;">
        Under review — response within 24 hours
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  const rows = Object.entries(payload.fields)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid rgba(200,169,110,0.1);font-family:'Courier New',monospace;color:rgba(200,169,110,0.6);font-size:10px;text-transform:uppercase;letter-spacing:0.15em;width:180px;">${escape(k)}</td><td style="padding:6px 12px;border-bottom:1px solid rgba(200,169,110,0.1);color:#e8e0d0;font-size:13px;">${escape(String(v ?? "—"))}</td></tr>`,
    )
    .join("");

  const adminHtml = `
<!doctype html><html><body style="margin:0;padding:0;background:#080808;color:#e8e0d0;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:32px;">
  <tr><td>
    <div style="font-family:Georgia,serif;color:#c8a96e;font-size:18px;letter-spacing:0.25em;">APEX — NEW APPLICATION</div>
    <div style="margin-top:8px;font-family:'Courier New',monospace;font-size:11px;color:rgba(200,169,110,0.6);letter-spacing:0.15em;">REF ${payload.refCode} · ${escape(payload.company)} · ${escape(payload.intentType)}</div>
    <table cellpadding="0" cellspacing="0" style="margin-top:24px;width:100%;background:#0c0c0c;border:1px solid rgba(200,169,110,0.15);border-radius:4px;">
      ${rows}
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    await resend.emails.send({
      from: fromAddress,
      to: payload.email,
      subject: `Your APEX access request — ${payload.refCode}`,
      html: applicantHtml,
    });
  } catch (err) {
    console.error("[apply] applicant email failed", err);
  }

  if (adminEmail) {
    try {
      await resend.emails.send({
        from: fromAddress,
        to: adminEmail,
        subject: `New APEX application — ${payload.company} / ${payload.intentType}`,
        html: adminHtml,
      });
    } catch (err) {
      console.error("[apply] admin email failed", err);
    }
  }
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const data = parsed.data;

  const supabase = createAdminClient();

  // Generate ref_code with a few retries for the rare collision case.
  let refCode = generateRefCode();
  let inserted = false;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    const { error } = await supabase.from("apex_applications").insert({
      full_name: data.full_name,
      title: nullify(data.title ?? null),
      company: data.company,
      market: nullify(data.market ?? null),
      aum_range: nullify(data.aum_range ?? null),
      email: data.email,
      intent_type: data.intent_type,
      problem_statement: nullify(data.problem_statement ?? null),
      signal_score: data.signal_score ?? null,
      linkedin_url: nullify(data.linkedin_url ?? null),
      website_url: nullify(data.website_url ?? null),
      referral_source: nullify(data.referral_source ?? null),
      referral_code: nullify(data.referral_code ?? null),
      phantom_scan_authorized: data.phantom_scan_authorized ?? false,
      osint_score: data.osint_score ?? null,
      ref_code: refCode,
    });

    if (!error) {
      inserted = true;
      break;
    }

    lastError = error;
    // 23505 = unique_violation in Postgres
    if (error.code === "23505" && error.message?.includes("ref_code")) {
      refCode = generateRefCode();
      continue;
    }
    if (error.code === "23505" && error.message?.includes("email")) {
      return NextResponse.json(
        { error: "An application with this email already exists." },
        { status: 409 },
      );
    }
    break;
  }

  if (!inserted) {
    console.error("[apply] insert failed", lastError);
    return NextResponse.json(
      { error: "Could not save application." },
      { status: 500 },
    );
  }

  // Fire emails (do not block response on errors — already logged).
  await sendEmails({
    refCode,
    email: data.email,
    fullName: data.full_name,
    company: data.company,
    intentType: data.intent_type,
    fields: {
      "Full name": data.full_name,
      Title: data.title ?? "—",
      Company: data.company,
      Market: data.market ?? "—",
      "AUM range": data.aum_range ?? "—",
      Email: data.email,
      Intent: data.intent_type,
      "Problem statement": data.problem_statement ?? "—",
      "Signal score": data.signal_score ?? "—",
      LinkedIn: data.linkedin_url ?? "—",
      Website: data.website_url ?? "—",
      "Referral source": data.referral_source ?? "—",
      "Referral code": data.referral_code ?? "—",
      "Phantom scan": data.phantom_scan_authorized ? "authorized" : "skipped",
      "OSINT score": data.osint_score ?? "—",
    },
  });

  return NextResponse.json({ success: true, ref_code: refCode });
}
