/**
 * ChoresApp Backend
 * Stack: Express + Supabase + Stripe
 * Deploy: Railway
 *
 * ENV VARS (set in Railway dashboard):
 *   STRIPE_SECRET_KEY       sk_live_...
 *   STRIPE_WEBHOOK_SECRET   whsec_...
 *   SUPABASE_URL            https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY    service_role key (NOT anon)
 *   FRONTEND_URL            https://choresnearme.com
 */

require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Register / Login (Supabase handles tokens, we store extra profile data)
// ─────────────────────────────────────────────────────────────────────────────

// Register a new user
app.post("/api/auth/register", async (req, res) => {
  const { email, password, firstName, lastName, phone, zip, role } = req.body;

  try {
    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) return res.json({ error: authError.message });

    const userId = authData.user.id;

    // 2. Create Stripe customer for this user
    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: { userId },
    });

    // 3. Store profile in users table
    const { error: dbError } = await supabase.from("users").insert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      zip,
      role: role || "worker",
      stripe_customer_id: customer.id,
    });

    if (dbError) return res.json({ error: dbError.message });

    res.json({
      success: true,
      userId,
      token: authData.session?.access_token,
      user: { id: userId, email, firstName, lastName, role },
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return res.json({ error: error.message });

    // Fetch full profile from users table
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    res.json({
      success: true,
      token: data.session.access_token,
      user: profile,
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
    .select(`*, poster:users!poster_id(first_name, last_name, rating, identity_verified)`)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(parseInt(limit));

  if (zip) query = query.eq("zip", zip);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return res.json({ error: error.message });

  res.json({ jobs: data });
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

    // Fetch poster's Stripe customer ID
    const { data: poster } = await supabase
      .from("users").select("stripe_customer_id").eq("id", req.user.id).single();

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
      customer: poster.stripe_customer_id,
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
