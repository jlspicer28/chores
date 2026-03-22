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
 *   RESEND_API_KEY          re_...
 *   SUPPORT_EMAIL           your@email.com
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
app.use(express.json({ limit: "10mb" }));
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || "https://choresnearme.com",
  "https://choresnearme.com",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
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

// ── Admin middleware — restricts routes to the ADMIN_EMAIL account ────────────
function requireAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || req.user.email !== adminEmail) {
    return res.status(403).json({ error: "Forbidden" });
  }
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
  const { email, password, firstName, lastName, phone, zip, role, skills } = req.body;

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

    // 2. Create auth user in Supabase Auth (store name in metadata for token lookups)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName || "", last_name: lastName || "" }
      }
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
      skills: Array.isArray(skills) && skills.length > 0 ? skills : [],
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
        is_admin: (profile?.email || email).toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase(),
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
    .maybeSingle();

  if (error) return res.json({ error: error.message });
  if (!data) return res.json({ error: "User not found in database — please sign in again." });

  // If name is blank in our table but exists in auth metadata, backfill it
  const authFirst = req.user.user_metadata?.first_name || "";
  const authLast = req.user.user_metadata?.last_name || "";
  if ((!data.first_name || !data.last_name) && (authFirst || authLast)) {
    await supabase.from("users").update({
      first_name: data.first_name || authFirst,
      last_name: data.last_name || authLast,
    }).eq("id", req.user.id);
    data.first_name = data.first_name || authFirst;
    data.last_name = data.last_name || authLast;
  }

  res.json({
    user: {
      ...data,
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      is_admin: (data.email || "").toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase(),
    }
  });
});

// Update profile
app.post("/api/auth/update-profile", requireAuth, async (req, res) => {
  const { firstName, lastName, phone, zip, age, bio, skills } = req.body;
  console.log("📝 update-profile:", { userId: req.user.id, bio, skills, age });

  // Only update fields explicitly sent — never wipe fields with undefined
  const updates = {};
  if (firstName !== undefined) updates.first_name = firstName;
  if (lastName !== undefined) updates.last_name = lastName;
  if (phone !== undefined) updates.phone = phone;
  if (zip !== undefined) updates.zip = zip;
  if (age !== undefined) updates.age = age ? parseInt(age) : null;
  if (bio !== undefined) updates.bio = (bio && bio.trim()) ? bio.trim() : null;
  if (skills !== undefined) updates.skills = skills || [];

  if (Object.keys(updates).length === 0) return res.json({ success: true });

  const { error } = await supabase.from("users").update(updates).eq("id", req.user.id);

  console.log("📝 update-profile result:", error ? error.message : "success");
  if (error) return res.json({ error: error.message });
  res.json({ success: true });
});

app.post("/api/auth/upload-avatar", requireAuth, async (req, res) => {
  const { base64, mimeType } = req.body;
  if (!base64 || !mimeType) return res.json({ error: "Missing image data" });

  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64.replace(/^data:.*?;base64,/, ""), "base64");
    const ext = (mimeType.split("/")[1] || "jpg").replace("jpeg","jpg");
    // Use timestamp in filename to bust CDN cache on update
    const fileName = `avatars/${req.user.id}_${Date.now()}.${ext}`;

    // Delete old avatar files for this user to keep storage clean
    try {
      const { data: existingFiles } = await supabase.storage.from("avatars").list("avatars", { search: req.user.id });
      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage.from("avatars").remove(existingFiles.map(f => `avatars/${f.name}`));
      }
    } catch(e) { /* non-fatal */ }

    // Upload to Supabase Storage (bucket: "avatars")
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) return res.json({ error: uploadError.message });

    // Get public URL
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = urlData.publicUrl;

    // Save URL to users table
    await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", req.user.id);

    res.json({ success: true, avatarUrl });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.json({ error: err.message });
  }
});

app.post("/api/auth/delete-account", requireAuth, async (req, res) => {
  const userId = req.user.id;
  console.log("🗑️ Deleting account for user:", userId);
  try {
    // Delete user's jobs
    await supabase.from("jobs").delete().eq("poster_id", userId);
    // Delete user's messages
    await supabase.from("messages").delete().or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    // Delete user's notifications
    await supabase.from("notifications").delete().eq("user_id", userId);
    // Delete user's applications
    await supabase.from("applications").delete().eq("worker_id", userId);
    // Delete user row
    await supabase.from("users").delete().eq("id", userId);
    // Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) console.error("Auth delete error (non-fatal):", error.message);
    console.log("✅ Account deleted:", userId);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete account error:", err);
    res.json({ error: err.message });
  }
});


// ── Change Password ─────────────────────────────────────────────────────────
app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.json({ error: "Current and new passwords are required" });
  if (newPassword.length < 8) return res.json({ error: "New password must be at least 8 characters" });

  try {
    // Verify current password by attempting to sign in
    const { data: profile } = await supabase.from("users").select("email").eq("id", req.user.id).single();
    if (!profile) return res.json({ error: "User not found" });

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });
    if (signInError) return res.json({ error: "Current password is incorrect" });

    // Update password via admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(req.user.id, {
      password: newPassword,
    });
    if (updateError) return res.json({ error: updateError.message });

    res.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.json({ error: err.message });
  }
});

// ── Data Export ──────────────────────────────────────────────────────────────
app.get("/api/auth/export-data", requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const [
      { data: profile },
      { data: jobs },
      { data: applications },
      { data: messages },
      { data: reviews },
      { data: notifications },
      { data: escrowRecords },
    ] = await Promise.all([
      supabase.from("users").select("id, email, first_name, last_name, phone, zip, role, bio, skills, rating, jobs_completed, total_earned, created_at").eq("id", userId).single(),
      supabase.from("jobs").select("id, title, description, category, pay, zip, date, duration, status, created_at").eq("poster_id", userId),
      supabase.from("applications").select("id, job_id, message, availability, status, created_at").eq("worker_id", userId),
      supabase.from("messages").select("id, sender_id, recipient_id, job_id, type, body, created_at").or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order("created_at", { ascending: false }).limit(500),
      supabase.from("reviews").select("id, job_id, reviewer_id, reviewee_id, rating, comment, tags, created_at").or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`),
      supabase.from("notifications").select("id, type, category, title, body, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
      supabase.from("escrow").select("id, job_id, amount, fee, worker_gets, status, created_at, released_at").or(`poster_id.eq.${userId},worker_id.eq.${userId}`),
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      profile: profile || {},
      jobs: jobs || [],
      applications: applications || [],
      messages: (messages || []).length,
      reviewsReceived: (reviews || []).filter(r => r.reviewee_id === userId),
      reviewsGiven: (reviews || []).filter(r => r.reviewer_id === userId),
      notifications: (notifications || []).length,
      escrow: escrowRecords || [],
    });
  } catch (err) {
    console.error("Data export error:", err.message);
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// JOBS — Create, list, apply, book
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/ping", (req, res) => res.json({ ok: true }));

app.get("/api/jobs/applied", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ jobIds: [] });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.json({ jobIds: [] });
  const { data } = await supabase
    .from("applications")
    .select("job_id")
    .eq("worker_id", user.id);
  res.json({ jobIds: (data || []).map(a => a.job_id) });
});

// Get all open jobs (optionally filter by zip)
app.get("/api/jobs", async (req, res) => {
  const { zip, category, limit = 50 } = req.query;

  let query = supabase
    .from("jobs")
    .select(`*, poster:users!poster_id(id, first_name, last_name, rating, jobs_completed, created_at, identity_verified), applications(count)`)
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
    applicant_count: j.applications?.[0]?.count || 0,
  }));

  res.json({ jobs });
});

// Get a single job
// Get all jobs posted by the current user
app.get("/api/jobs/mine", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select(`*, applications(count)`)
    .eq("poster_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.json({ error: error.message });

  const jobs = (data || []).map(j => ({
    id: j.id,
    title: j.title,
    description: j.description,
    category: j.category,
    pay: parseFloat(j.pay) || 0,
    zip: j.zip,
    lat: j.lat,
    lng: j.lng,
    date: j.date,
    duration: j.duration,
    status: j.status,
    worker_id: j.worker_id,
    applicant_count: j.applications?.[0]?.count || 0,
    created_at: j.created_at,
    photos: j.photos || [],
  }));

  res.json({ jobs });
});

app.get("/api/users/:id/profile", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, avatar_url, bio, skills, rating, jobs_completed, created_at, zip, identity_verified")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return res.json({ error: "User not found" });
  res.json({
    user: {
      id: data.id,
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      avatarUrl: data.avatar_url || null,
      bio: data.bio || "",
      skills: data.skills || [],
      rating: data.rating || null,
      jobsCompleted: data.jobs_completed || 0,
      memberSince: data.created_at,
      zip: data.zip || "",
      identityVerified: data.identity_verified || false,
    }
  });
});

app.get("/api/jobs/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select(`*, poster:users!poster_id(first_name, last_name, rating, identity_verified)`)
    .eq("id", req.params.id)
    .single();

  if (error) return res.json({ error: error.message });
  res.json({ job: data });
});


// Edit a job (poster only, only if status is still "open")
app.patch("/api/jobs/:id", requireAuth, async (req, res) => {
  const { title, description, category, pay, zip, lat, lng, date, duration, photos } = req.body;
  console.log("✏️ Editing job:", req.params.id, "by user:", req.user.id, "updates:", { title, category, pay, date });

  const { data: job } = await supabase
    .from("jobs").select("poster_id, status").eq("id", req.params.id).single();

  if (!job) return res.json({ error: "Job not found" });
  if (job.poster_id !== req.user.id) return res.json({ error: "Not authorized" });
  if (job.status === "booked" || job.status === "completed") {
    return res.json({ error: "Cannot edit a job that is already booked or completed" });
  }

  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (pay !== undefined) updates.pay = parseFloat(pay);
  if (zip !== undefined) updates.zip = zip;
  if (lat !== undefined) updates.lat = lat;
  if (lng !== undefined) updates.lng = lng;
  if (date !== undefined) updates.date = date;
  if (duration !== undefined) updates.duration = duration;
  if (photos !== undefined) updates.photos = photos;

  console.log("✏️ Applying updates:", updates);
  const { data, error } = await supabase
    .from("jobs").update(updates).eq("id", req.params.id).select().single();

  if (error) {
    console.error("❌ Job update error:", error);
    return res.json({ error: error.message });
  }
  console.log("✅ Job updated:", data.id);
  res.json({ success: true, job: data });
});

// Post a new job (poster only)
app.post("/api/jobs/create", requireAuth, async (req, res) => {
  const { title, description, category, pay, zip, lat, lng, date, duration, photos } = req.body;
  console.log("📋 Creating job:", { title, category, pay, zip, userId: req.user.id });

  if (!title || !pay) return res.json({ error: "Title and pay are required" });

  // Ensure user row exists in our users table (handles stale sessions after DB wipe)
  const { data: existingUser } = await supabase
    .from("users").select("id").eq("id", req.user.id).maybeSingle();

  if (!existingUser) {
    console.log("⚠️  User not in users table, inserting...");
    // Try to get name from auth metadata, fallback to email prefix
    const firstName = req.user.user_metadata?.first_name || req.user.email?.split("@")[0] || "";
    const lastName = req.user.user_metadata?.last_name || "";
    const { error: upsertErr } = await supabase.from("users").insert({
      id: req.user.id,
      email: req.user.email,
      first_name: firstName,
      last_name: lastName,
      role: "poster",
      rating: 5.0,
      jobs_completed: 0,
      identity_verified: false,
      created_at: new Date().toISOString(),
    });
    if (upsertErr) {
      console.error("❌ Could not create user row:", upsertErr.message);
      return res.json({ error: "Session is outdated. Please sign out and sign back in." });
    }
  }

  const { data, error } = await supabase.from("jobs").insert({
    poster_id: req.user.id,
    title: title.trim(),
    description: description || null,
    category: category || null,
    pay: parseFloat(pay),
    zip: zip || null,
    lat: lat || null,
    lng: lng || null,
    date: date || null,
    duration: duration || null,
    status: "open",
    photos: photos || [],
  }).select().single();

  if (error) {
    console.error("❌ Job create error:", error);
    return res.json({ error: error.message, detail: error.details });
  }
  console.log("✅ Job created:", data.id);
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

  const { data: cancelledJob } = await supabase
    .from("jobs").select("id, title, worker_id, poster_id").eq("id", req.params.id).single();

  await supabase.from("jobs").update({ status: "cancelled" }).eq("id", req.params.id);

  // Notify worker if they were assigned
  if (cancelledJob?.worker_id) {
    const { data: poster } = await supabase.from("users").select("first_name,last_name").eq("id", req.user.id).maybeSingle();
    const posterName = poster ? `${poster.first_name} ${poster.last_name}`.trim() : "The poster";
    await notify(cancelledJob.worker_id, {
      type: "cancelled", category: "alert", icon: "⚠️",
      title: "Job cancelled",
      body: `${posterName} cancelled "${cancelledJob.title}"`,
      jobId: req.params.id, relatedUserId: req.user.id,
    });
  }

  // If worker cancels their own accepted job, increment their cancellation count
  if (cancelledJob?.worker_id === req.user.id) {
    const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    const { data: recentCancels } = await supabase
      .from("jobs")
      .select("id")
      .eq("worker_id", req.user.id)
      .eq("status", "cancelled")
      .gte("updated_at", thirtyDaysAgo);
    await supabase.from("users").update({
      cancellations_30d: (recentCancels?.length || 0) + 1
    }).eq("id", req.user.id);
  }
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

    const workerCents = Math.round(job.pay * 100);
    const feeCents = Math.round(workerCents * 0.08);
    const amountCents = workerCents + feeCents; // poster pays job.pay * 1.08

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
      worker_gets: job.pay,
      stripe_intent_id: intent.id,
      status: "held",
    }).select().single();

    // Mark job as booked
    await supabase.from("jobs").update({ status: "booked", worker_id: workerId }).eq("id", jobId);

    // Notify worker: accepted / hired
    const { data: posterUser } = await supabase.from("users").select("first_name,last_name").eq("id", req.user.id).maybeSingle();
    const posterName = posterUser ? `${posterUser.first_name} ${posterUser.last_name}`.trim() : "The poster";
    await notify(workerId, {
      type: "accepted", category: "job", icon: "✅",
      title: "Application accepted!",
      body: `${posterName} hired you for "${job.title}" · $${job.pay}`,
      jobId, relatedUserId: req.user.id,
    });
    // Notify poster: payment held confirmation
    await notify(req.user.id, {
      type: "payment", category: "payment", icon: "🔒",
      title: "Payment held in escrow",
      body: `$${job.pay} held for "${job.title}" · releases when job is confirmed complete`,
      jobId,
    });

    res.json({ success: true, intentId: intent.id, escrowId: escrow.id });
  } catch (err) {
    console.error("Charge error:", err.message);
    res.json({ error: err.message });
  }
});

// Confirm job complete (either party confirms — when both confirm, auto-release)
// Get all escrow transactions for current user
app.get("/api/escrow", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const SEL = "*, job:jobs(title, category), poster:users!poster_id(first_name, last_name), worker:users!worker_id(first_name, last_name)";

  // Query 1: records where user is explicitly poster or worker
  const { data: direct, error: e1 } = await supabase
    .from("escrow").select(SEL)
    .or(`poster_id.eq.${userId},worker_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (e1) return res.json({ error: e1.message });

  // Query 2: jobs where this user is the worker (catches old null worker_id escrow records)
  const { data: workerJobs } = await supabase
    .from("jobs").select("id").eq("worker_id", userId);
  const workerJobIds = (workerJobs || []).map(j => j.id);

  let extra = [];
  if (workerJobIds.length > 0) {
    const directIds = new Set((direct || []).map(e => e.id));
    const { data: byJob } = await supabase
      .from("escrow").select(SEL)
      .in("job_id", workerJobIds)
      .order("created_at", { ascending: false });
    extra = (byJob || []).filter(e => !directIds.has(e.id));
    // Self-heal: stamp worker_id on records that are missing it
    for (const e of extra) {
      if (!e.worker_id) {
        supabase.from("escrow").update({ worker_id: userId }).eq("id", e.id).then(() => {});
      }
    }
  }

  const mapTxn = e => ({
    id: e.id,
    job: e.job?.title || "Job",
    jobId: e.job_id,
    amount: parseFloat(e.amount) || 0,
    workerGets: parseFloat(e.worker_gets) || parseFloat(e.amount) || 0,
    status: e.status || "held",
    poster: e.poster ? `${e.poster.first_name} ${e.poster.last_name}`.trim() : "Poster",
    posterId: e.poster_id,
    worker: e.worker ? `${e.worker.first_name} ${e.worker.last_name}`.trim() : "Worker",
    workerId: e.worker_id || userId,
    posterConfirmed: e.poster_confirmed || false,
    workerConfirmed: e.worker_confirmed || false,
    createdAt: new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    releasedAt: e.released_at ? new Date(e.released_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null,
    stripeIntentId: e.stripe_intent_id,
  });

  const transactions = [...(direct || []), ...extra].map(mapTxn);
  res.json({ transactions });
});

app.post("/api/escrow/:id/confirm", requireAuth, async (req, res) => {
  const { data: escrow } = await supabase
    .from("escrow").select("*").eq("id", req.params.id).single();

  if (!escrow) return res.json({ error: "Escrow not found" });

  const isPoster = escrow.poster_id === req.user.id;
  let isWorker = escrow.worker_id === req.user.id;
  // Fallback: check if user is worker on the associated job (covers null worker_id records)
  if (!isWorker && !isPoster && escrow.job_id) {
    const { data: job } = await supabase.from("jobs").select("worker_id").eq("id", escrow.job_id).maybeSingle();
    if (job?.worker_id === req.user.id) isWorker = true;
    // Also patch the escrow worker_id so future calls work
    if (isWorker) await supabase.from("escrow").update({ worker_id: req.user.id }).eq("id", escrow.id);
  }
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

      // Update worker stats — fetch current stats first for streak/badge logic
      const { data: workerStats } = await supabase
        .from("users")
        .select("jobs_completed, total_earned, last_job_date, daily_jobs_streak, jobs_today, jobs_today_date, five_star_streak, consecutive_five_star, cancellations_30d, unique_rehire_clients, poster_ids_worked_for")
        .eq("id", escrow.worker_id).single();

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const lastJobDate = workerStats?.last_job_date?.slice(0, 10);

      // Track jobs completed today (for Speed Demon badge)
      let jobsToday = (workerStats?.jobs_today_date === todayStr) ? (workerStats?.jobs_today || 0) + 1 : 1;

      // Track unique posters this worker has worked for (for Repeat Favorite)
      const posterIdsRaw = workerStats?.poster_ids_worked_for || [];
      const posterIds = Array.isArray(posterIdsRaw) ? posterIdsRaw : [];
      const newPosterId = String(escrow.poster_id);
      const updatedPosterIds = posterIds.includes(newPosterId) ? posterIds : [...posterIds, newPosterId];
      const uniqueRehireClients = updatedPosterIds.length;

      // Fetch the job category for this escrow
      const { data: escrowJob } = await supabase.from("jobs").select("category, completed_at").eq("id", escrow.job_id).maybeSingle();

      // 5-star streak: check latest review for this worker
      const { data: recentReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", escrow.worker_id)
        .order("created_at", { ascending: false })
        .limit(5);
      const consecutiveFiveStar = recentReviews ? recentReviews.filter(r => r.rating === 5).length : 0;

      await supabase.from("users").update({
        jobs_completed: (workerStats?.jobs_completed || 0) + 1,
        total_earned: (workerStats?.total_earned || 0) + escrow.worker_gets,
        last_job_date: now.toISOString(),
        jobs_today: jobsToday,
        jobs_today_date: todayStr,
        poster_ids_worked_for: updatedPosterIds,
        unique_rehire_clients: uniqueRehireClients,
        consecutive_five_star: consecutiveFiveStar,
      }).eq("id", escrow.worker_id);

      // Fetch job title for notifications
      const { data: completedJob } = await supabase.from("jobs").select("title").eq("id", escrow.job_id).maybeSingle();
      const jobTitle = completedJob?.title || "the job";

      // Notify worker: payment released
      await notify(escrow.worker_id, {
        type: "payment", category: "payment", icon: "💸",
        title: "Payment released!",
        body: `$${escrow.worker_gets.toFixed(2)} deposited · "${jobTitle}"`,
        jobId: escrow.job_id, relatedUserId: escrow.poster_id,
      });
      // Notify poster: job complete
      await notify(escrow.poster_id, {
        type: "complete", category: "job", icon: "✅",
        title: "Job marked complete",
        body: `"${jobTitle}" is complete · $${escrow.amount} charged · Rate your worker`,
        jobId: escrow.job_id, relatedUserId: escrow.worker_id,
      });
      // Notify poster: receipt
      await notify(escrow.poster_id, {
        type: "payment", category: "payment", icon: "🧾",
        title: "Invoice & receipt",
        body: `$${escrow.amount} charged · "${jobTitle}"`,
        jobId: escrow.job_id,
      });
      // Remind both to leave a review
      await notify(escrow.worker_id, {
        type: "rating", category: "reminder", icon: "⭐",
        title: "Reminder: Rate your client",
        body: `How did the job go? Leave a review for "${jobTitle}"`,
        jobId: escrow.job_id, relatedUserId: escrow.poster_id,
      });
      await notify(escrow.poster_id, {
        type: "rating", category: "reminder", icon: "⭐",
        title: "Reminder: Rate your worker",
        body: `How did your worker do on "${jobTitle}"? Leave a review`,
        jobId: escrow.job_id, relatedUserId: escrow.worker_id,
      });

      return res.json({ success: true, released: true });
    } catch (err) {
      console.error("Auto-release error:", err.message);
      return res.json({ error: err.message });
    }
  }

  // One side confirmed — notify the other party
  const otherUserId = isPoster ? escrow.worker_id : escrow.poster_id;
  const confirmerRole = isPoster ? "poster" : "worker";
  const { data: confirmerUser } = await supabase.from("users").select("first_name,last_name").eq("id", req.user.id).maybeSingle();
  const confirmerName = confirmerUser ? `${confirmerUser.first_name} ${confirmerUser.last_name}`.trim() : "The other party";
  const { data: pendingJob } = await supabase.from("jobs").select("title").eq("id", escrow.job_id).maybeSingle();
  await notify(otherUserId, {
    type: "confirmed", category: "job", icon: "🚗",
    title: confirmerRole === "poster" ? "Poster confirmed complete!" : "Worker confirmed complete!",
    body: `${confirmerName} confirmed "${pendingJob?.title || "the job"}" is done — confirm on your end to release payment`,
    jobId: escrow.job_id, relatedUserId: req.user.id,
  });

  res.json({ success: true, released: false, awaitingOtherParty: true });
});

// Refund escrow (dispute resolved for poster, or worker no-show)
app.post("/api/charge-saved", requireAuth, async (req, res) => {
  const { paymentMethodId, amountCents, jobId, jobTitle, workerId } = req.body;
  try {
    const { data: user } = await supabase
      .from("users").select("stripe_customer_id").eq("id", req.user.id).single();
    if (!user?.stripe_customer_id) return res.json({ error: "No saved payment method found." });

    // Fetch job for pay amount
    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
    if (!job) return res.json({ error: "Job not found" });

    const workerCents = Math.round(job.pay * 100);
    const feeCents = Math.round(workerCents * 0.08);
    const totalCents = workerCents + feeCents;

    const intent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      payment_method: paymentMethodId,
      customer: user.stripe_customer_id,
      confirm: true,
      capture_method: "manual",
      off_session: true,
      metadata: { jobId, posterId: req.user.id, workerId: workerId || "" },
      return_url: process.env.FRONTEND_URL || "https://choresnearme.com",
    });

    if (intent.status === "requires_action") {
      return res.json({ requiresAction: true, clientSecret: intent.client_secret, intentId: intent.id });
    }
    if (intent.status !== "requires_capture") {
      return res.json({ error: "Payment failed — please try a different card." });
    }

    // Create escrow record
    await supabase.from("escrow").insert({
      job_id: jobId,
      poster_id: req.user.id,
      worker_id: workerId || null,
      amount: job.pay,
      fee: job.pay * 0.08,
      worker_gets: job.pay,
      stripe_intent_id: intent.id,
      status: "held",
    });

    // Mark job as booked
    if (workerId) {
      await supabase.from("jobs").update({ status: "booked", worker_id: workerId }).eq("id", jobId);
    }

    // Notify worker
    if (workerId) {
      const { data: posterUser } = await supabase.from("users").select("first_name,last_name").eq("id", req.user.id).maybeSingle();
      const posterName = posterUser ? `${posterUser.first_name} ${posterUser.last_name}`.trim() : "The poster";
      await notify(workerId, {
        type: "accepted", category: "job", icon: "✅",
        title: "You've been hired!",
        body: `${posterName} hired you for "${job.title}" · $${job.pay} in escrow`,
        jobId, relatedUserId: req.user.id,
      });
    }

    res.json({ success: true, intentId: intent.id });
  } catch (err) {
    console.error("charge-saved error:", err.message);
    res.json({ error: err.message });
  }
});

app.post("/api/refund", requireAuth, async (req, res) => {
  const { escrowId } = req.body;
  if (!escrowId) return res.json({ error: "escrowId is required" });

  const { data: escrow } = await supabase
    .from("escrow").select("*").eq("id", escrowId).single();

  if (!escrow) return res.json({ error: "Escrow not found" });

  // Only poster or worker can request a refund
  if (escrow.poster_id !== req.user.id && escrow.worker_id !== req.user.id) {
    return res.json({ error: "Not authorized to refund this escrow" });
  }
  if (escrow.status !== "held") {
    return res.json({ error: "Can only refund escrow that is currently held" });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(escrow.stripe_intent_id);

    if (intent.status === "requires_capture") {
      await stripe.paymentIntents.cancel(escrow.stripe_intent_id);
    } else {
      await stripe.refunds.create({ payment_intent: escrow.stripe_intent_id });
    }

    await supabase.from("escrow").update({ status: "refunded" }).eq("id", escrowId);
    await supabase.from("jobs").update({ status: "cancelled" }).eq("id", escrow.job_id);

    const { data: refundedJob } = await supabase.from("jobs").select("title").eq("id", escrow.job_id).maybeSingle();
    const refundTitle = refundedJob?.title || "the job";

    await notify(escrow.poster_id, {
      type: "payment", category: "payment", icon: "↩️",
      title: "Refund issued",
      body: `$${escrow.amount} refunded · "${refundTitle}"`,
      jobId: escrow.job_id,
    });
    await notify(escrow.worker_id, {
      type: "cancelled", category: "alert", icon: "⚠️",
      title: "Job refunded",
      body: `"${refundTitle}" was refunded to the poster`,
      jobId: escrow.job_id, relatedUserId: escrow.poster_id,
    });

    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT ROLE — Save user's preferred default role
app.post("/api/user/default-role", requireAuth, async (req, res) => {
  const { defaultRole } = req.body;
  if (!["worker","poster"].includes(defaultRole)) return res.json({ error: "Invalid role" });
  const { error } = await supabase.from("users").update({ default_role: defaultRole }).eq("id", req.user.id);
  if (error) return res.json({ error: error.message });
  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// BANK ACCOUNT — Save and load worker bank details
app.post("/api/bank-details", requireAuth, async (req, res) => {
  const { holder, bankName, accountType, routing, accountLast4 } = req.body;
  const { error } = await supabase.from("users").update({
    bank_holder: holder || null,
    bank_name: bankName || null,
    bank_account_type: accountType || null,
    bank_routing_masked: routing ? ("•••••" + String(routing).slice(-4)) : null,
    bank_last4: accountLast4 || null,
  }).eq("id", req.user.id);
  if (error) return res.json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/bank-details", requireAuth, async (req, res) => {
  const { data, error } = await supabase.from("users")
    .select("bank_holder, bank_name, bank_account_type, bank_routing_masked, bank_last4")
    .eq("id", req.user.id).maybeSingle();
  if (error) return res.json({ error: error.message });
  res.json({ bank: data || {} });
});

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

    const frontendUrl = (process.env.FRONTEND_URL || "https://choresnearme.com").replace(/^http:\/\//, "https://");
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${frontendUrl}/?connect=refresh`,
      return_url:  `${frontendUrl}/?connect=complete`,
      type: "account_onboarding",
    });

    res.json({ onboardingUrl: accountLink.url });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Check connect status

// ─────────────────────────────────────────────────────────────────────────────
// BADGE STATS — Return all badge-relevant stats for the current user
app.get("/api/badge-stats", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("jobs_completed, total_earned, rating, jobs_today, jobs_today_date, consecutive_five_star, unique_rehire_clients, cancellations_30d, poster_ids_worked_for, skills, created_at")
    .eq("id", req.user.id).single();

  if (error || !data) return res.json({ error: "Could not fetch badge stats" });

  // Count unique job categories completed by this worker
  const { data: completedEscrows } = await supabase
    .from("escrow")
    .select("job_id")
    .eq("worker_id", req.user.id)
    .eq("status", "released");

  let categoriesDone = 0;
  if (completedEscrows && completedEscrows.length > 0) {
    const jobIds = completedEscrows.map(e => e.job_id).filter(Boolean);
    if (jobIds.length > 0) {
      const { data: jobs } = await supabase.from("jobs").select("category").in("id", jobIds);
      const cats = [...new Set((jobs || []).map(j => j.category).filter(Boolean))];
      categoriesDone = cats.length;
    }
  }

  // Today's jobs (for Speed Demon)
  const todayStr = new Date().toISOString().slice(0, 10);
  const jobsToday = data.jobs_today_date === todayStr ? (data.jobs_today || 0) : 0;

  res.json({
    jobsCompleted: data.jobs_completed || 0,
    totalEarned: data.total_earned || 0,
    rating: data.rating || 0,
    jobsToday,
    consecutiveFiveStar: data.consecutive_five_star || 0,
    uniqueRehireClients: data.unique_rehire_clients || 0,
    cancellations30d: data.cancellations_30d || 0,
    categoriesDone,
    skillsCount: Array.isArray(data.skills) ? data.skills.length : 0,
  });
});

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
    .from("users").select("stripe_customer_id, default_payment_method").eq("id", req.user.id).single();

  if (!user?.stripe_customer_id) return res.json({ cards: [] });

  try {
    const customer = await stripe.customers.retrieve(user.stripe_customer_id);
    const defaultPmId = customer.invoice_settings?.default_payment_method || user?.default_payment_method || null;
    const pms = await stripe.paymentMethods.list({ customer: user.stripe_customer_id, type: "card" });
    res.json({ cards: pms.data.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      exp_month: pm.card.exp_month,
      exp_year: pm.card.exp_year,
      isDefault: pm.id === defaultPmId,
    }))});
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Create a SetupIntent so frontend can safely collect a new card
app.post("/api/customer/setup-intent", requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users").select("stripe_customer_id, email, first_name, last_name").eq("id", req.user.id).single();

    let customerId = user?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        metadata: { userId: req.user.id },
      });
      customerId = customer.id;
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", req.user.id);
    }

    const intent = await stripe.setupIntents.create({
      customer: customerId,
      usage: "off_session",
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Set a card as the default payment method
app.post("/api/customer/set-default", requireAuth, async (req, res) => {
  const { paymentMethodId } = req.body;
  const { data: user } = await supabase
    .from("users").select("stripe_customer_id").eq("id", req.user.id).single();
  if (!user?.stripe_customer_id) return res.json({ error: "No Stripe customer found" });
  try {
    await stripe.customers.update(user.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    await supabase.from("users").update({ default_payment_method: paymentMethodId }).eq("id", req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Detach (remove) a saved card
app.post("/api/customer/detach-card", requireAuth, async (req, res) => {
  const { paymentMethodId } = req.body;
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    res.json({ success: true });
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
  const { jobId, revieweeId, rating, comment, tags } = req.body;

  if (!jobId || !revieweeId || !rating) return res.json({ error: "jobId, revieweeId, and rating are required" });
  if (rating < 1 || rating > 5) return res.json({ error: "Rating must be between 1 and 5" });

  // Verify reviewer was part of this job (poster or worker)
  const { data: job } = await supabase.from("jobs")
    .select("poster_id, worker_id, status")
    .eq("id", jobId).maybeSingle();
  if (!job) return res.json({ error: "Job not found" });
  if (job.poster_id !== req.user.id && job.worker_id !== req.user.id) {
    return res.json({ error: "You can only review jobs you participated in" });
  }
  if (job.status !== "completed") {
    return res.json({ error: "You can only review completed jobs" });
  }

  // Prevent duplicate reviews for same job
  const { data: existing } = await supabase.from("reviews")
    .select("id").eq("job_id", jobId).eq("reviewer_id", req.user.id).maybeSingle();
  if (existing) return res.json({ success: true, alreadyReviewed: true });

  const { error } = await supabase.from("reviews").insert({
    job_id: jobId,
    reviewer_id: req.user.id,
    reviewee_id: revieweeId,
    rating,
    comment,
    tags: tags || [],
  });

  if (error) return res.json({ error: error.message });

  // Recalculate reviewee's average rating
  const { data: reviews } = await supabase
    .from("reviews").select("rating").eq("reviewee_id", revieweeId);

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await supabase.from("users").update({ rating: Math.round(avg * 10) / 10 }).eq("id", revieweeId);

  res.json({ success: true });
});

// Get reviews about the current user (received reviews)
app.get("/api/reviews/mine", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:users!reviewer_id(first_name, last_name, avatar_url), job:jobs(title)")
    .eq("reviewee_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.json({ error: error.message });

  const reviews = (data || []).map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    tags: r.tags || [],
    jobTitle: r.job?.title || "Completed job",
    reviewerName: r.reviewer ? `${r.reviewer.first_name} ${r.reviewer.last_name}`.trim() : "Anonymous",
    reviewerAvatar: r.reviewer?.avatar_url || null,
    date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));

  res.json({ reviews });
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

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

// Get all notifications for current user
app.get("/api/notifications", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*, job:jobs(title)")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return res.json({ error: error.message });

  const notifications = (data || []).map(n => ({
    id: n.id,
    type: n.type,
    category: n.category,
    icon: n.icon,
    title: n.title,
    body: n.body,
    job: n.job?.title || null,
    job_id: n.job_id,
    unread: !n.read,
    time: timeAgo(n.created_at),
    created_at: n.created_at,
  }));

  res.json({ notifications });
});

// Mark notifications as read
app.post("/api/notifications/read", requireAuth, async (req, res) => {
  const { ids } = req.body; // array of IDs, or omit to mark all read
  let query = supabase.from("notifications").update({ read: true }).eq("user_id", req.user.id);
  if (ids?.length) query = query.in("id", ids);
  const { error } = await query;
  if (error) return res.json({ error: error.message });
  res.json({ success: true });
});

// ── Notification helper ────────────────────────────────────────────────────
async function notify(userId, { type, category, icon, title, body, jobId=null, relatedUserId=null }) {
  if (!userId) return;
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type, category, icon, title, body,
    job_id: jobId || null,
    related_user_id: relatedUserId || null,
    read: false,
    created_at: new Date().toISOString(),
  });
  if (error) console.warn("⚠️  Notify error:", error.message);
}

// Get applicants for a job (poster only)
app.get("/api/jobs/:id/applicants", requireAuth, async (req, res) => {
  const jobId = req.params.id;
  const { data: job } = await supabase.from("jobs").select("poster_id").eq("id", jobId).maybeSingle();
  if (!job || job.poster_id !== req.user.id) return res.json({ error: "Not authorized" });

  const { data, error } = await supabase
    .from("applications")
    .select("*, worker:users!worker_id(id, first_name, last_name, avatar_url, rating, jobs_completed)")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) return res.json({ error: error.message });

  const applicants = (data || []).map(a => ({
    id: a.worker_id,
    name: a.worker ? `${a.worker.first_name} ${a.worker.last_name}`.trim() : "Worker",
    avatarUrl: a.worker?.avatar_url || null,
    rating: a.worker?.rating || 5.0,
    jobsDone: a.worker?.jobs_completed || 0,
    message: a.message || "",
    availability: a.availability || "",
    appliedAt: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  res.json({ applicants });
});

app.post("/api/jobs/:id/apply", requireAuth, async (req, res) => {
  const { message, availability, workerName } = req.body;
  const jobId = req.params.id;
  const workerId = req.user.id;
  console.log("📝 Application:", { jobId, workerId, workerName });

  if (!jobId) return res.json({ error: "jobId is required" });
  if (!message) return res.json({ error: "Message is required" });

  try {
    // Check for duplicate application
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("worker_id", workerId)
      .maybeSingle();
    if (existing) return res.json({ error: "You have already applied to this job.", alreadyApplied: true });
    const { data: existingWorker } = await supabase
      .from("users").select("id").eq("id", workerId).maybeSingle();
    if (!existingWorker) {
      const { error: workerInsertErr } = await supabase.from("users").insert({
        id: workerId,
        email: "",
        first_name: workerName?.split(" ")[0] || "",
        last_name: workerName?.split(" ").slice(1).join(" ") || "",
        role: "worker",
        rating: 5.0,
        jobs_completed: 0,
        identity_verified: false,
        created_at: new Date().toISOString(),
      });
      if (workerInsertErr) console.warn("Worker insert warning:", workerInsertErr.message);
    }

    // 1. Save application
    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      worker_id: workerId,
      message,
      availability: Array.isArray(availability) ? availability.join(", ") : (availability || null),
      status: "pending",
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.error("❌ Application insert error:", error);
      return res.json({ error: error.message, detail: error.details });
    }
    console.log("✅ Application saved for job:", jobId);

    // 2. Get job + poster info
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, poster_id, pay")
      .eq("id", jobId)
      .single();

    // 3. Write message to poster's inbox
    if (job?.poster_id) {
      const { error: msgErr } = await supabase.from("messages").insert({
        sender_id: workerId,
        recipient_id: job.poster_id,
        job_id: jobId,
        type: "application",
        preview: `${workerName || "Someone"} applied to your job`,
        body: message,
        read: false,
        created_at: new Date().toISOString(),
      });
      if (msgErr) console.warn("Message insert warning:", msgErr.message);

      // Notify poster: new applicant
      await notify(job.poster_id, {
        type: "applied", category: "job", icon: "👤",
        title: "New applicant!",
        body: `${workerName || "Someone"} applied to ${job.title}`,
        jobId, relatedUserId: workerId,
      });
    }

    // Notify worker: application submitted confirmation
    await notify(workerId, {
      type: "applied_sent", category: "job", icon: "📋",
      title: "Application sent!",
      body: `Your application for "${job?.title || "the job"}" was submitted`,
      jobId,
    });

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
// ── Inbox: latest message per conversation (both sent + received) ──────────────
app.get("/api/messages/inbox", requireAuth, async (req, res) => {
  const uid = req.user.id;

  // Fetch all messages involving this user (sent or received)
  const { data, error } = await supabase
    .from("messages")
    .select("*, job:jobs(id,title), sender:users!sender_id(id,first_name,last_name), recipient:users!recipient_id(id,first_name,last_name)")
    .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
    .order("created_at", { ascending: false });

  if (error) return res.json({ error: error.message });

  // Group into conversations keyed by other_user_id + job_id
  const convMap = {};
  for (const m of (data || [])) {
    const otherId = m.sender_id === uid ? m.recipient_id : m.sender_id;
    const otherUser = m.sender_id === uid ? m.recipient : m.sender;
    const key = `${otherId}__${m.job_id || "nojob"}`;
    if (!convMap[key]) {
      convMap[key] = {
        id: key,
        other_user_id: otherId,
        from: otherUser ? `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim() || "User" : "User",
        job: m.job?.title || "",
        job_id: m.job_id || null,
        preview: m.preview || m.body?.slice(0, 80) || "",
        time: timeAgo(m.created_at),
        unread: !m.read && m.recipient_id === uid,
        latest_at: m.created_at,
      };
    }
  }

  const conversations = Object.values(convMap).sort((a,b) => new Date(b.latest_at) - new Date(a.latest_at));
  res.json({ messages: conversations });
});

// ── Thread: all messages between two users on a job ────────────────────────
app.get("/api/messages/thread/:otherUserId", requireAuth, async (req, res) => {
  const uid = req.user.id;
  const { otherUserId } = req.params;
  const { job_id } = req.query;

  let query = supabase
    .from("messages")
    .select("*, sender:users!sender_id(id,first_name,last_name)")
    .or(`and(sender_id.eq.${uid},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${uid})`)
    .order("created_at", { ascending: true });

  if (job_id && job_id !== "nojob") query = query.eq("job_id", job_id);

  const { data, error } = await query;
  if (error) return res.json({ error: error.message });

  // Mark all received messages as read
  await supabase.from("messages")
    .update({ read: true })
    .eq("recipient_id", uid)
    .eq("sender_id", otherUserId);

  const thread = (data || []).map(m => ({
    id: m.id,
    from_me: m.sender_id === uid,
    sender_name: m.sender ? `${m.sender.first_name || ""} ${m.sender.last_name || ""}`.trim() : "User",
    text: m.body || m.preview || "",
    time: timeAgo(m.created_at),
    created_at: m.created_at,
    type: m.type,
  }));

  res.json({ thread });
});

// ── Send a message ──────────────────────────────────────────────────────────
app.post("/api/messages/send", requireAuth, async (req, res) => {
  const { recipientId, jobId, body } = req.body;
  const uid = req.user.id;

  if (!recipientId || !body?.trim()) return res.json({ error: "recipientId and body are required" });

  // Get sender name
  const { data: sender } = await supabase.from("users").select("first_name,last_name").eq("id", uid).maybeSingle();
  const senderName = sender ? `${sender.first_name || ""} ${sender.last_name || ""}`.trim() : "Someone";

  const { data, error } = await supabase.from("messages").insert({
    sender_id: uid,
    recipient_id: recipientId,
    job_id: jobId || null,
    type: "message",
    preview: body.slice(0, 80),
    body: body.trim(),
    read: false,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error("❌ Send message error:", error);
    return res.json({ error: error.message });
  }

  console.log(`✅ Message sent: ${senderName} → ${recipientId}`);
  res.json({
    success: true,
    message: {
      id: data.id,
      from_me: true,
      sender_name: senderName,
      text: data.body,
      time: "just now",
      created_at: data.created_at,
      type: "message",
    }
  });
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
  await supabase.from("support_tickets").insert({ type: "contact", category, subject, message, user_id: userId, email, created_at: new Date().toISOString() });
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
${steps}`, user_id: userId, email, created_at: new Date().toISOString() });
  await sendSupportEmail(`[Bug] ${type}`, `From: ${email}

${description}

Steps:
${steps}`);
  res.json({ success: true });
});

app.post("/api/support/feature", async (req, res) => {
  const { area, description, userId, email } = req.body;
  console.log(`💡 Feature request: [${area}] from ${email}`);
  await supabase.from("support_tickets").insert({ type: "feature", category: area, subject: `Feature: ${area}`, message: description, user_id: userId, email, created_at: new Date().toISOString() });
  await sendSupportEmail(`[Feature] ${area}`, `From: ${email}

${description}`);
  res.json({ success: true });
});



// WEBHOOKS
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Real-time platform stats (owner only)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayStr = todayStart.toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [
      { count: totalJobs },
      { count: openJobs },
      { count: completedJobs },
      { count: totalWorkers },
      { count: totalPosters },
      { count: newUsersWeek },
      { data: releasedEscrow },
      { data: releasedToday },
      { count: openDisputes },
      { data: recentJobs },
      { data: recentUsers },
      { data: recentEscrowActivity },
    ] = await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "worker"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "poster"),
      supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabase.from("escrow").select("fee").eq("status", "released"),
      supabase.from("escrow").select("fee").eq("status", "released").gte("released_at", todayStr),
      supabase.from("escrow").select("*", { count: "exact", head: true }).eq("status", "disputed"),
      supabase.from("jobs").select("id, title, pay, zip, status, category, created_at").order("created_at", { ascending: false }).limit(30),
      supabase.from("users").select("id, first_name, last_name, role, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("escrow").select("id, amount, status, created_at, released_at, job:jobs(title)").order("created_at", { ascending: false }).limit(15),
    ]);

    // Revenue
    const totalRevenue = (releasedEscrow || []).reduce((s, e) => s + (parseFloat(e.fee) || 0), 0);
    const todayRevenue = (releasedToday || []).reduce((s, e) => s + (parseFloat(e.fee) || 0), 0);
    const avgFee = releasedEscrow?.length ? totalRevenue / releasedEscrow.length : 0;
    const completedToday = releasedToday?.length || 0;

    // Top zips
    const zipCount = {};
    (recentJobs || []).forEach(j => { if (j.zip) zipCount[j.zip] = (zipCount[j.zip] || 0) + 1; });
    const topZips = Object.entries(zipCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([zip, jobs]) => ({ zip, jobs }));

    // Build activity feed from multiple sources
    const activity = [];
    (recentJobs || []).slice(0, 8).forEach(j => {
      if (j.status === "completed") {
        activity.push({ icon: "✅", text: `Job completed · ${j.title} · $${j.pay}`, ts: new Date(j.created_at).getTime() });
      } else if (j.status === "open") {
        activity.push({ icon: "📋", text: `Job posted · ${j.title} · $${j.pay}`, ts: new Date(j.created_at).getTime() });
      }
    });
    (recentUsers || []).forEach(u => {
      const icon = u.role === "poster" ? "🏠" : "👤";
      activity.push({ icon, text: `New ${u.role} signup · ${u.first_name} ${u.last_name}`.trim(), ts: new Date(u.created_at).getTime() });
    });
    (recentEscrowActivity || []).forEach(e => {
      if (e.status === "released") {
        activity.push({ icon: "💸", text: `Payment released · ${e.job?.title || "Job"} · $${e.amount}`, ts: new Date(e.released_at || e.created_at).getTime() });
      } else if (e.status === "disputed") {
        activity.push({ icon: "⚖️", text: `Dispute opened · ${e.job?.title || "Job"} · $${e.amount}`, ts: new Date(e.created_at).getTime() });
      } else if (e.status === "held") {
        activity.push({ icon: "🔒", text: `Escrow funded · ${e.job?.title || "Job"} · $${e.amount}`, ts: new Date(e.created_at).getTime() });
      }
    });
    activity.sort((a, b) => b.ts - a.ts);

    const relTime = (ts) => {
      const diff = (Date.now() - ts) / 1000;
      if (diff < 60) return `${Math.floor(diff)}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}hr ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };

    res.json({
      totalJobs: totalJobs || 0,
      openJobs: openJobs || 0,
      completedJobs: completedJobs || 0,
      completedToday,
      totalWorkers: totalWorkers || 0,
      totalPosters: totalPosters || 0,
      newUsersWeek: newUsersWeek || 0,
      totalRevenue: +totalRevenue.toFixed(2),
      todayRevenue: +todayRevenue.toFixed(2),
      avgFee: +avgFee.toFixed(2),
      openDisputes: openDisputes || 0,
      topZips,
      recentActivity: activity.slice(0, 15).map(a => ({ icon: a.icon, text: a.text, time: relTime(a.ts) })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.json({ error: err.message });
  }
});

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
