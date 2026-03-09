/**
 * ChoresApp Backend
 * Stack: Express + Supabase + Stripe
 * Deploy: Render (https://chores-backend4.onrender.com)
 *
 * ENV VARS (set in Render dashboard):
 *   STRIPE_SECRET_KEY       sk_live_...
 *   STRIPE_WEBHOOK_SECRET   whsec_...
 *   SUPABASE_URL            https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY    service_role key (NOT anon)
 *   FRONTEND_URL            https://choresnearme.com
 *   ANTHROPIC_API_KEY       sk-ant-...
 *   RESEND_API_KEY          re_...
 *   SUPPORT_EMAIL           your@email.com
 */

require("dotenv").config();
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const { createClient } = require("@supabase/supabase-js");

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ── Auth middleware — verifies Supabase JWT on protected routes ───────────────
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Invalid token" });

  req.user = user;
  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ChoresApp backend running" }));
app.get("/ping", (req, res) => res.json({ ok: true }));

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Register / Login (Supabase handles tokens, we store extra profile data)
// ─────────────────────────────────────────────────────────────────────────────

// Register a new user
app.post("/api/auth/register", async (req, res) => {
  const { email, password, firstName, lastName, phone, zip, role } = req.body;

  try {
    // 1. Check if user already exists in our users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      // User already registered — tell frontend to redirect to login
      return res.json({ alreadyExists: true });
    }

    // 2. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    // Supabase returns identities:[] when email already exists in auth but not our table
    if (authError || authData?.user?.identities?.length === 0) {
      return res.json({ alreadyExists: true });
    }

    const userId = authData.user.id;

    // 3. Write profile to our custom users table (NOT Supabase's auth.users)
    const { error: dbError } = await supabase.from("users").insert({
      id: userId,
      email: email.toLowerCase().trim(),
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      zip: zip || null,
      role: role || "worker",
      rating: 5.0,
      jobs_completed: 0,
      identity_verified: false,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Profile insert error:", dbError.message);
      return res.json({ error: "Account created but profile save failed: " + dbError.message });
    }

    res.json({
      success: true,
      userId,
      token: authData.session?.access_token || null,
      user: { id: userId, email, firstName, lastName, phone, zip, role: role || "worker" },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.json({ error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.json({ error: error.message });

    // Fetch full profile from our custom users table
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    res.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: profile?.email || email,
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        phone: profile?.phone || "",
        zip: profile?.zip || "",
        role: profile?.role || "worker",
        rating: profile?.rating || 5.0,
        jobsCompleted: profile?.jobs_completed || 0,
      },
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Get current user profile
app.get("/api/auth/me", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error) return res.json({ error: error.message });
  res.json({ user: data });
});

// Update profile
app.post("/api/auth/update-profile", requireAuth, async (req, res) => {
  const { firstName, lastName, phone, zip } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ first_name: firstName, last_name: lastName, phone, zip })
    .eq("id", req.user.id);

  if (error) return res.json({ error: error.message });
  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOBS — Create, list, apply, book
// ─────────────────────────────────────────────────────────────────────────────

// Get all open jobs (optionally filter by zip)
app.get("/api/jobs", async (req, res) => {
  const { zip, category, limit = 50 } = req.query;

  let query = supabase
    .from("jobs")
    .select(`*, poster:users!poster_id(id, first_name, last_name, rating, jobs_completed, created_at, identity_verified)`)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(parseInt(limit));

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return res.json({ error: error.message });

  // Normalize jobs with poster info
  const jobs = (data || []).map(j => ({
    ...j,
    poster_name: j.poster ? `${j.poster.first_name} ${j.poster.last_name}`.trim() : "Anonymous",
    poster_rating: j.poster?.rating || 5.0,
    poster_jobs_count: j.poster?.jobs_completed || 0,
    poster_since: j.poster?.created_at ? new Date(j.poster.created_at).toLocaleDateString("en-US", { month:"short", year:"numeric" }) : "",
    poster_verified: j.poster?.identity_verified || false,
    applicant_count: 0,
  }));

  res.json({ jobs });
});

// Get a single job
app.get("/api/jobs/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select(`*, poster:users!poster_id(first_name, last_name, rating, identity_verified)`)
    .eq("id", req.params.id)
    .single();

  if (error) return res.json({ error: error.message });
  res.json({ job: data });
});

// Post a new job (poster only)
app.post("/api/jobs/create", requireAuth, async (req, res) => {
  const { title, description, category, pay, zip, lat, lng, date, duration } = req.body;

  const { data, error } = await supabase.from("jobs").insert({
    poster_id: req.user.id,
    title, description, category,
    pay: parseFloat(pay),
    zip, lat, lng, date, duration,
    status: "open",
  }).select().single();

  if (error) return res.json({ error: error.message });
  res.json({ success: true, job: data });
});

// Delete / cancel a job
app.post("/api/jobs/:id/cancel", requireAuth, async (req, res) => {
  // Verify poster owns this job
  const { data: job } = await supabase
    .from("jobs").select("poster_id, status").eq("id", req.params.id).single();

  if (!job) return res.json({ error: "Job not found" });
  if (job.poster_id !== req.user.id) return res.json({ error: "Not authorized" });
  if (job.status === "booked") return res.json({ error: "Cannot cancel a booked job — open a dispute instead" });

  await supabase.from("jobs").update({ status: "cancelled" }).eq("id", req.params.id);
  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS — Escrow hold, release, refund
// ─────────────────────────────────────────────────────────────────────────────

// Fund escrow (poster books a worker — funds held, not released)
app.post("/api/charge", requireAuth, async (req, res) => {
  const { paymentMethodId, jobId, workerId } = req.body;

  try {
    // Fetch job details
    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
    if (!job) return res.json({ error: "Job not found" });

    // Fetch poster — create Stripe customer on first payment if needed
    const { data: poster } = await supabase
      .from("users").select("stripe_customer_id, email, first_name, last_name").eq("id", req.user.id).single();

    let stripeCustomerId = poster.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: poster.email,
        name: `${poster.first_name} ${poster.last_name}`,
        metadata: { userId: req.user.id },
      });
      stripeCustomerId = customer.id;
      await supabase.from("users").update({ stripe_customer_id: stripeCustomerId }).eq("id", req.user.id);
    }

    const amountCents = Math.round(job.pay * 100);
    const feeCents = Math.round(amountCents * 0.08);
    const workerCents = amountCents - feeCents;

    // Fetch worker's Connect ID
    const { data: worker } = await supabase
      .from("users").select("stripe_connect_id").eq("id", workerId).single();

    // Create PaymentIntent with manual capture (holds funds without charging yet)
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      payment_method: paymentMethodId,
      customer: stripeCustomerId,
      confirm: true,
      capture_method: "manual",
      metadata: {
        jobId,
        workerId,
        posterId: req.user.id,
        workerConnectId: worker?.stripe_connect_id || "",
        workerAmountCents: workerCents.toString(),
      },
      return_url: process.env.FRONTEND_URL || "https://choresnearme.com",
    });

    if (intent.status === "requires_action") {
      return res.json({ requiresAction: true, clientSecret: intent.client_secret, intentId: intent.id });
    }

    if (intent.status !== "requires_capture") {
      return res.json({ error: "Payment failed — please try a different card." });
    }

    // Create escrow record in Supabase
    const { data: escrow } = await supabase.from("escrow").insert({
      job_id: jobId,
      poster_id: req.user.id,
      worker_id: workerId,
      amount: job.pay,
      fee: job.pay * 0.08,
      worker_gets: job.pay * 0.92,
      stripe_intent_id: intent.id,
      status: "held",
    }).select().single();

    // Mark job as booked
    await supabase.from("jobs").update({ status: "booked", worker_id: workerId }).eq("id", jobId);

    res.json({ success: true, intentId: intent.id, escrowId: escrow.id });
  } catch (err) {
    console.error("Charge error:", err.message);
    res.json({ error: err.message });
  }
});

// Confirm job complete (either party confirms — when both confirm, auto-release)
app.post("/api/escrow/:id/confirm", requireAuth, async (req, res) => {
  const { data: escrow } = await supabase
    .from("escrow").select("*").eq("id", req.params.id).single();

  if (!escrow) return res.json({ error: "Escrow not found" });

  const isPoster = escrow.poster_id === req.user.id;
  const isWorker = escrow.worker_id === req.user.id;
  if (!isPoster && !isWorker) return res.json({ error: "Not authorized" });

  const update = isPoster ? { poster_confirmed: true } : { worker_confirmed: true };
  const { data: updated } = await supabase
    .from("escrow").update(update).eq("id", req.params.id).select().single();

  // If both confirmed, release funds
  if (updated.poster_confirmed && updated.worker_confirmed) {
    try {
      await stripe.paymentIntents.capture(escrow.stripe_intent_id);

      // Transfer to worker if they have a Connect account
      const { data: worker } = await supabase
        .from("users").select("stripe_connect_id").eq("id", escrow.worker_id).single();

      if (worker?.stripe_connect_id) {
        await stripe.transfers.create({
          amount: Math.round(escrow.worker_gets * 100),
          currency: "usd",
          destination: worker.stripe_connect_id,
          transfer_group: escrow.stripe_intent_id,
        });
      }

      // Update escrow + job status
      await supabase.from("escrow").update({
        status: "released",
        released_at: new Date().toISOString(),
      }).eq("id", req.params.id);

      await supabase.from("jobs").update({ status: "completed" }).eq("id", escrow.job_id);

      // Update worker stats
      await supabase.rpc("increment_worker_stats", {
        worker_id: escrow.worker_id,
        earned: escrow.worker_gets,
      });

      return res.json({ success: true, released: true });
    } catch (err) {
      console.error("Auto-release error:", err.message);
      return res.json({ error: err.message });
    }
  }

  res.json({ success: true, released: false, awaitingOtherParty: true });
});

// Refund escrow (dispute resolved for poster, or worker no-show)
app.post("/api/refund", requireAuth, async (req, res) => {
  const { escrowId } = req.body;

  const { data: escrow } = await supabase
    .from("escrow").select("*").eq("id", escrowId).single();

  if (!escrow) return res.json({ error: "Escrow not found" });

  try {
    const intent = await stripe.paymentIntents.retrieve(escrow.stripe_intent_id);

    if (intent.status === "requires_capture") {
      await stripe.paymentIntents.cancel(escrow.stripe_intent_id);
    } else {
      await stripe.refunds.create({ payment_intent: escrow.stripe_intent_id });
    }

    await supabase.from("escrow").update({ status: "refunded" }).eq("id", escrowId);
    await supabase.from("jobs").update({ status: "cancelled" }).eq("id", escrow.job_id);

    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE CONNECT — Worker payout onboarding
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/connect/onboard", requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users").select("email, stripe_connect_id").eq("id", req.user.id).single();

    // If already has a Connect account, just generate a new link
    let accountId = user.stripe_connect_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: { transfers: { requested: true } },
        metadata: { userId: req.user.id },
      });
      accountId = account.id;

      await supabase.from("users")
        .update({ stripe_connect_id: accountId }).eq("id", req.user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/connect/refresh`,
      return_url:  `${process.env.FRONTEND_URL}/connect/complete`,
      type: "account_onboarding",
    });

    res.json({ onboardingUrl: accountLink.url });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Check connect status
app.get("/api/connect/status", requireAuth, async (req, res) => {
  const { data: user } = await supabase
    .from("users").select("stripe_connect_id").eq("id", req.user.id).single();

  if (!user?.stripe_connect_id) return res.json({ ready: false, reason: "No Connect account yet" });

  try {
    const account = await stripe.accounts.retrieve(user.stripe_connect_id);
    res.json({
      ready: account.charges_enabled && account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due || [],
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SAVED CARDS
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/customer/save-card", requireAuth, async (req, res) => {
  const { paymentMethodId } = req.body;

  const { data: user } = await supabase
    .from("users").select("stripe_customer_id").eq("id", req.user.id).single();

  try {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: user.stripe_customer_id });
    await stripe.customers.update(user.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    res.json({ success: true, card: { brand: pm.card.brand, last4: pm.card.last4 } });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/api/customer/cards", requireAuth, async (req, res) => {
  const { data: user } = await supabase
    .from("users").select("stripe_customer_id").eq("id", req.user.id).single();

  try {
    const pms = await stripe.paymentMethods.list({ customer: user.stripe_customer_id, type: "card" });
    res.json({ cards: pms.data.map(pm => ({
      id: pm.id, brand: pm.card.brand, last4: pm.card.last4,
      expMonth: pm.card.exp_month, expYear: pm.card.exp_year,
    }))});
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// IDENTITY VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/verify/identity/start", requireAuth, async (req, res) => {
  try {
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { userId: req.user.id },
      options: {
        document: {
          allowed_types: ["driving_license", "passport", "id_card"],
          require_id_number: true,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });
    res.json({ clientSecret: session.client_secret, sessionId: session.id });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.post("/api/verify/identity/check", requireAuth, async (req, res) => {
  const { sessionId } = req.body;
  try {
    const session = await stripe.identity.verificationSessions.retrieve(sessionId);
    const verified = session.status === "verified";

    if (verified) {
      await supabase.from("users")
        .update({ identity_verified: true }).eq("id", req.user.id);
    }

    res.json({ status: session.status, verified });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
const emailCodes = new Map(); // In production use Redis or Supabase table

app.post("/api/verify/email/send", async (req, res) => {
  const { email, name } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  emailCodes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });

  console.log(`📧 Email code for ${email}: ${code}`);

  // Send real email via Resend if API key is configured
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Chores <noreply@choresnearme.com>",
          to: [email],
          subject: "Your Chores verification code",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2 style="color:#2D6A4F">Your verification code</h2>
              <p>Hi ${name || "there"},</p>
              <p>Enter this code to verify your email address:</p>
              <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#2D6A4F;padding:24px;background:#f0faf4;border-radius:12px;text-align:center">${code}</div>
              <p style="color:#888;font-size:13px;margin-top:24px">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
            </div>
          `
        })
      });
    } catch (e) {
      console.error("Resend error:", e);
    }
  }

  res.json({ success: true, message: "Code sent" });
});

app.post("/api/verify/email/check", async (req, res) => {
  const { email, code } = req.body;
  const record = emailCodes.get(email);

  if (!record) return res.json({ error: "No code found — request a new one" });
  if (Date.now() > record.expires) return res.json({ error: "Code expired" });
  if (record.code !== code) return res.json({ error: "Incorrect code" });

  emailCodes.delete(email);
  res.json({ success: true, verified: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/reviews/create", requireAuth, async (req, res) => {
  const { jobId, revieweeId, rating, comment } = req.body;

  const { error } = await supabase.from("reviews").insert({
    job_id: jobId,
    reviewer_id: req.user.id,
    reviewee_id: revieweeId,
    rating,
    comment,
  });

  if (error) return res.json({ error: error.message });

  // Recalculate reviewee's average rating
  const { data: reviews } = await supabase
    .from("reviews").select("rating").eq("reviewee_id", revieweeId);

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await supabase.from("users").update({ rating: Math.round(avg * 10) / 10 }).eq("id", revieweeId);

  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// JOB APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

app.post("/api/jobs/:id/apply", async (req, res) => {
  const { message, availability, workerId, workerName } = req.body;
  const jobId = req.params.id;
  try {
    // 1. Save application
    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      worker_id: workerId,
      message,
      availability: availability?.join(", "),
      status: "pending",
      created_at: new Date().toISOString(),
    });
    if (error) return res.json({ error: error.message });

    // 2. Get job + poster info
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, poster_id, pay")
      .eq("id", jobId)
      .single();

    // 3. Write message to poster's inbox
    if (job?.poster_id) {
      await supabase.from("messages").insert({
        sender_id: workerId,
        recipient_id: job.poster_id,
        job_id: jobId,
        type: "application",
        preview: `${workerName || "Someone"} applied to your job`,
        body: message,
        read: false,
        created_at: new Date().toISOString(),
      }).catch(()=>{});
    }

    // 4. Get updated applicant count
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId);

    res.json({ success: true, applicantCount: count });
  } catch (err) {
    console.error("Apply error:", err.message);
    res.json({ error: err.message });
  }
});

// Get inbox messages for logged-in user
app.get("/api/messages/inbox", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*, job:jobs(title), sender:users!sender_id(first_name, last_name)")
    .eq("recipient_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.json({ error: error.message });

  const messages = (data || []).map(m => ({
    id: m.id,
    from: m.sender ? `${m.sender.first_name} ${m.sender.last_name}`.trim() : "Someone",
    job: m.job?.title || "",
    preview: m.preview || m.body?.slice(0, 80) || "",
    time: timeAgo(m.created_at),
    unread: !m.read,
    type: m.type,
    body: m.body,
  }));

  res.json({ messages });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT SUBMISSIONS (stored in Supabase, emailed if Resend configured)
// ─────────────────────────────────────────────────────────────────────────────
async function sendSupportEmail(subject, body) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Chores App <noreply@choresnearme.com>",
        to: [process.env.SUPPORT_EMAIL || "support@choresnearme.com"],
        subject,
        html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${body}</pre>`
      })
    });
  } catch(e) { console.error("Support email error:", e); }
}

app.post("/api/support/contact", async (req, res) => {
  const { category, subject, message, userId, email } = req.body;
  console.log(`📩 Support: [${category}] ${subject} from ${email}`);
  await supabase.from("support_tickets").insert({ type: "contact", category, subject, message, user_id: userId, email, created_at: new Date().toISOString() }).catch(()=>{});
  await sendSupportEmail(`[Support] ${subject}`, `From: ${email}
Category: ${category}

${message}`);
  res.json({ success: true });
});

app.post("/api/support/bug", async (req, res) => {
  const { type, description, steps, userId, email } = req.body;
  console.log(`🐛 Bug report: [${type}] from ${email}`);
  await supabase.from("support_tickets").insert({ type: "bug", category: type, subject: `Bug: ${type}`, message: `${description}

Steps:
${steps}`, user_id: userId, email, created_at: new Date().toISOString() }).catch(()=>{});
  await sendSupportEmail(`[Bug] ${type}`, `From: ${email}

${description}

Steps:
${steps}`);
  res.json({ success: true });
});

app.post("/api/support/feature", async (req, res) => {
  const { area, description, userId, email } = req.body;
  console.log(`💡 Feature request: [${area}] from ${email}`);
  await supabase.from("support_tickets").insert({ type: "feature", category: area, subject: `Feature: ${area}`, message: description, user_id: userId, email, created_at: new Date().toISOString() }).catch(()=>{});
  await sendSupportEmail(`[Feature] ${area}`, `From: ${email}

${description}`);
  res.json({ success: true });
});


// ─────────────────────────────────────────────────────────────────────────────
// AI — Generate application message
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/ai/write-application", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.json({ error: "No prompt provided" });
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }]
    });
    const text = message.content?.[0]?.text?.trim();
    res.json({ text });
  } catch(err) {
    console.error("AI error:", err.message);
    res.json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// AI - Write application message via Claude
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/ai/write-application", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.json({ error: "No prompt provided" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) return res.json({ error: "No response from AI" });
    res.json({ text });
  } catch(err) {
    console.error("AI write error:", err.message);
    res.json({ error: err.message });
  }
});

// WEBHOOKS
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.sendStatus(400);
  }

  switch (event.type) {
    case "payment_intent.amount_capturable_updated": {
      const intent = event.data.object;
      await supabase.from("escrow")
        .update({ status: "held" }).eq("stripe_intent_id", intent.id);
      break;
    }
    case "account.updated": {
      const account = event.data.object;
      const ready = account.charges_enabled && account.payouts_enabled;
      if (ready) {
        await supabase.from("users")
          .update({ stripe_connect_id: account.id })
          .eq("stripe_connect_id", account.id);
      }
      break;
    }
    case "identity.verification_session.verified": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId) {
        await supabase.from("users")
          .update({ identity_verified: true }).eq("id", userId);
      }
      break;
    }
    default:
      break;
  }

  res.sendStatus(200);
});

// ─────────────────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ ChoresApp backend running on port ${PORT}`));
