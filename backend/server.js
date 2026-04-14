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
const http2 = require("http2");
const crypto = require("crypto");

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── APNs Push Notifications ─────────────────────────────────────────────────

function createApnsJwt() {
  const keyBase64 = process.env.APNS_KEY_BASE64;
  if (!keyBase64) return null;
  const key = Buffer.from(keyBase64, "base64").toString("utf8");
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: process.env.APNS_KEY_ID })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({ iss: process.env.APNS_TEAM_ID, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const signer = crypto.createSign("SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(key, "base64url");
  return `${header}.${claims}.${signature}`;
}

function sendPush(deviceToken, title, body, data = {}) {
  if (!process.env.APNS_KEY_BASE64) return Promise.resolve();
  const jwt = createApnsJwt();
  if (!jwt) return Promise.resolve();
  const bundleId = process.env.APNS_BUNDLE_ID || "com.choresapp.Chores";
  const host = "api.push.apple.com"; // production

  return new Promise((resolve) => {
    const client = http2.connect(`https://${host}`);
    const payload = JSON.stringify({ aps: { alert: { title, body }, sound: "default", badge: 1 }, ...data });
    const req = client.request({
      ":method": "POST", ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`, "apns-topic": bundleId,
      "apns-push-type": "alert", "apns-priority": "10", "content-type": "application/json",
    });
    req.on("response", (h) => { if (h[":status"] === 200) console.log(`[APNs] Sent to ${deviceToken.substring(0, 8)}...`); });
    req.on("end", () => { client.close(); resolve(); });
    req.on("error", () => { client.close(); resolve(); });
    req.write(payload); req.end();
  });
}

async function pushToUser(userId, title, body, data = {}) {
  const { data: tokens } = await supabase.from("device_tokens").select("device_token").eq("user_id", userId);
  if (!tokens || tokens.length === 0) return;
  for (const row of tokens) await sendPush(row.device_token, title, body, data);
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "25mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ── Geo helpers ───────────────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
const zipCache = {};
async function zipToCoords(zip) {
  if (zipCache[zip]) return zipCache[zip];
  try {
    const r = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!r.ok) return null;
    const d = await r.json();
    const coords = { lat: parseFloat(d.places[0].latitude), lng: parseFloat(d.places[0].longitude) };
    zipCache[zip] = coords;
    return coords;
  } catch { return null; }
}

// ── Referral code generator ──────────────────────────────────────────────────
function generateReferralCode(firstName) {
  const prefix = (firstName || "USER").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let suffix = "";
  for (let i = 0; i < 8 - prefix.length; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + suffix;
}

// ── Auth middleware — verifies Supabase JWT on protected routes ───────────────
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Invalid token" });

  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL || "jlspicer28@icloud.com";
  if (req.user.email.toLowerCase() !== adminEmail.toLowerCase()) {
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
    // Generate a unique referral code (retry on collision)
    let referralCode = generateReferralCode(firstName);
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing } = await supabase.from("users").select("id").eq("referral_code", referralCode).maybeSingle();
      if (!existing) break;
      referralCode = generateReferralCode(firstName);
    }

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
      referral_code: referralCode,
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
      refreshToken: authData.session?.refresh_token || null,
      user: { id: userId, email, first_name: firstName, last_name: lastName, firstName, lastName, phone, zip, role: role || "worker" },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, firstName, role || "worker").catch(e => console.warn("Welcome email failed:", e.message));

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
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: profile?.email || email,
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        phone: profile?.phone || "",
        zip: profile?.zip || "",
        role: profile?.role || "worker",
        rating: profile?.rating || 5.0,
        jobs_completed: profile?.jobs_completed || 0,
        jobsCompleted: profile?.jobs_completed || 0,
        avatar_url: profile?.avatar_url || null,
        bio: profile?.bio || "",
        age: profile?.age || null,
        address: profile?.address || "",
        skills: profile?.skills || [],
        identity_verified: profile?.identity_verified || false,
        default_role: profile?.default_role || null,
        created_at: profile?.created_at || null,
      },
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Refresh token
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.json({ error: "No refresh token provided" });
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) return res.json({ error: error?.message || "Refresh failed" });
    res.json({ token: data.session.access_token, refreshToken: data.session.refresh_token });
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
      is_admin: (data.email || "").toLowerCase() === "jlspicer28@icloud.com",
    }
  });
});

// Update profile
app.post("/api/auth/update-profile", requireAuth, async (req, res) => {
  const { firstName, lastName, phone, zip, age, bio, skills, address } = req.body;
  console.log("📝 update-profile:", { userId: req.user.id, bio, skills, age, address });

  // Only update fields explicitly provided — never wipe other fields with undefined
  const updates = {};
  if (firstName !== undefined) updates.first_name = firstName;
  if (lastName !== undefined) updates.last_name = lastName;
  if (phone !== undefined) updates.phone = phone;
  if (zip !== undefined) updates.zip = zip;
  if (age !== undefined) updates.age = age ? parseInt(age) : null;
  if (bio !== undefined) updates.bio = (bio && bio.trim()) ? bio.trim() : null;
  if (skills !== undefined) updates.skills = skills || [];
  if (address !== undefined) updates.address = (address && address.trim()) ? address.trim() : null;

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
    const fileName = `${req.user.id}_${Date.now()}.${ext}`;

    // Delete old avatar files for this user to keep storage clean
    try {
      const { data: existingFiles } = await supabase.storage.from("avatars").list("", { search: req.user.id });
      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage.from("avatars").remove(existingFiles.map(f => f.name));
      }
    } catch(e) { /* non-fatal */ }

    // Upload to Supabase Storage (bucket: "avatars")
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });

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
    // Delete user's escrow records
    await supabase.from("escrow").delete().or(`worker_id.eq.${userId},poster_id.eq.${userId}`);
    // Delete user's reviews (given and received)
    await supabase.from("reviews").delete().or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`);
    // Delete user's support tickets
    await supabase.from("support_tickets").delete().eq("user_id", userId);
    // Delete avatar from storage
    try {
      const { data: avatarFiles } = await supabase.storage.from("avatars").list("", { search: userId });
      if (avatarFiles && avatarFiles.length > 0) {
        await supabase.storage.from("avatars").remove(avatarFiles.map(f => f.name));
      }
    } catch(e) { /* non-fatal */ }
    // Delete user row from users table
    await supabase.from("users").delete().eq("id", userId);
    // Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) console.error("Auth delete error (non-fatal):", error.message);
    console.log("✅ Account fully deleted:", userId);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete account error:", err);
    res.json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// REFERRAL PROGRAM
// ─────────────────────────────────────────────────────────────────────────────

// Apply a referral code (during/after signup)
app.post("/api/referral/apply", requireAuth, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.json({ error: "Referral code is required" });

  try {
    // Check if user already has a referrer
    const { data: currentUser } = await supabase
      .from("users").select("id, referred_by").eq("id", req.user.id).single();
    if (currentUser?.referred_by) return res.json({ error: "You have already applied a referral code" });

    // Look up the referrer by code
    const { data: referrer } = await supabase
      .from("users").select("id, first_name").eq("referral_code", code.toUpperCase().trim()).maybeSingle();
    if (!referrer) return res.json({ error: "Invalid referral code" });

    // Can't refer yourself
    if (referrer.id === req.user.id) return res.json({ error: "You cannot use your own referral code" });

    // Check if a referral record already exists for this user
    const { data: existingReferral } = await supabase
      .from("referrals").select("id").eq("referred_id", req.user.id).maybeSingle();
    if (existingReferral) return res.json({ error: "You have already applied a referral code" });

    // Create referral record
    await supabase.from("referrals").insert({
      referrer_id: referrer.id,
      referred_id: req.user.id,
      status: "pending",
      credit_amount: 10,
    });

    // Set referred_by on the user
    await supabase.from("users").update({ referred_by: referrer.id }).eq("id", req.user.id);

    console.log(`🤝 Referral applied: ${req.user.id} referred by ${referrer.id} (${referrer.first_name})`);
    res.json({ success: true, referrerName: referrer.first_name });
  } catch (err) {
    console.error("Referral apply error:", err.message);
    res.json({ error: err.message });
  }
});

// Get current user's referral info
app.get("/api/referral/info", requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users").select("referral_code, referral_credit, referrals_count").eq("id", req.user.id).single();
    if (!user) return res.json({ error: "User not found" });

    // Fetch referral list
    const { data: referrals } = await supabase
      .from("referrals")
      .select("id, referred_id, status, credit_amount, created_at, completed_at")
      .eq("referrer_id", req.user.id)
      .order("created_at", { ascending: false });

    // Get names for referred users
    const referralList = [];
    for (const ref of (referrals || [])) {
      const { data: referred } = await supabase
        .from("users").select("first_name").eq("id", ref.referred_id).maybeSingle();
      referralList.push({
        id: ref.id,
        name: referred?.first_name || "User",
        status: ref.status,
        creditAmount: ref.credit_amount,
        createdAt: ref.created_at,
        completedAt: ref.completed_at,
      });
    }

    res.json({
      referralCode: user.referral_code,
      referralCredit: parseFloat(user.referral_credit) || 0,
      referralsCount: user.referrals_count || 0,
      referrals: referralList,
    });
  } catch (err) {
    console.error("Referral info error:", err.message);
    res.json({ error: err.message });
  }
});

// Get shareable referral message
app.get("/api/referral/share", requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users").select("referral_code").eq("id", req.user.id).single();
    if (!user?.referral_code) return res.json({ error: "No referral code found" });

    const message = `Join me on Chores and we both get $10! Use my code: ${user.referral_code} — Download at choresnearme.com/download`;
    res.json({ message, code: user.referral_code });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// JOBS — Create, list, apply, book
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/ping", (req, res) => res.json({ ok: true }));

// Debug: check what escrow records exist for the current user (remove in production)
app.get("/api/debug/escrow", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { data: allEscrow } = await supabase.from("escrow").select("id, job_id, poster_id, worker_id, status, amount, created_at").order("created_at", { ascending: false }).limit(20);
  const { data: myJobs } = await supabase.from("jobs").select("id, title, status, worker_id, poster_id").or(`worker_id.eq.${userId},poster_id.eq.${userId}`);
  res.json({ userId, allEscrow: allEscrow || [], myJobs: myJobs || [] });
});

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

// Get all open jobs filtered by real distance from worker's zip
app.get("/api/jobs", async (req, res) => {
  const { zip, maxDist = 25, category, limit = 200 } = req.query;
  const maxDistMiles = parseFloat(maxDist);

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Resolve the worker's zip to lat/lng for distance filtering
  let workerLat = null, workerLng = null;
  if (zip && zip.length === 5) {
    const cached = zipCache[zip];
    if (cached) { workerLat = cached.lat; workerLng = cached.lng; }
    else {
      try {
        const r = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (r.ok) {
          const d = await r.json();
          workerLat = parseFloat(d.places[0].latitude);
          workerLng = parseFloat(d.places[0].longitude);
          zipCache[zip] = { lat: workerLat, lng: workerLng };
        }
      } catch {}
    }
  }

  let query = supabase
    .from("jobs")
    .select(`*, poster:users!poster_id(id, first_name, last_name, rating, jobs_completed, created_at, identity_verified, preferences), applications(count)`)
    .eq("status", "open")
    .or(`date_iso.is.null,date_iso.gte.${today}`)
    .order("created_at", { ascending: false })
    .limit(parseInt(limit));

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return res.json({ error: error.message });

  // Calculate distance and filter
  function haversine(lat1, lng1, lat2, lng2) {
    const R = 3959; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  let filtered = (data || []);

  // If we have worker coordinates, filter by actual distance
  if (workerLat && workerLng) {
    filtered = filtered.filter(j => {
      if (j.lat && j.lng) {
        return haversine(workerLat, workerLng, j.lat, j.lng) <= maxDistMiles;
      }
      // No job coords — fall back to zip match
      return j.zip === zip;
    });
  } else if (zip) {
    // No worker coords — fall back to exact zip match
    filtered = filtered.filter(j => j.zip === zip);
  }

  const jobs = filtered.map(j => {
    let dist = 0;
    if (workerLat && workerLng && j.lat && j.lng) {
      dist = Math.round(haversine(workerLat, workerLng, j.lat, j.lng) * 10) / 10;
    }
    return {
      ...j,
      address: undefined, // never expose address to public feed
      poster_name: j.poster ? `${j.poster.first_name} ${j.poster.last_name}`.trim() : "Anonymous",
      poster_rating: j.poster?.rating || 5.0,
      poster_jobs_count: j.poster?.jobs_completed || 0,
      poster_since: j.poster?.created_at ? new Date(j.poster.created_at).toLocaleDateString("en-US", { month:"short", year:"numeric" }) : "",
      poster_verified: j.poster?.identity_verified || false,
      poster_exact_loc: j.poster?.preferences?.exactLoc === true,
      applicant_count: j.applications?.[0]?.count || 0,
      dist,
    };
  });

  // Sort by distance (closest first)
  jobs.sort((a, b) => a.dist - b.dist);

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
    date_iso: j.date_iso,
    duration: j.duration,
    status: j.status,
    worker_id: j.worker_id,
    poster_id: j.poster_id,
    applicant_count: j.applications?.[0]?.count || 0,
    created_at: j.created_at,
    photos: j.photos || [],
    address: j.address,
  }));

  res.json({ jobs });
});

app.get("/api/users/:id/profile", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, avatar_url, bio, skills, rating, jobs_completed, created_at, zip, identity_verified, preferences")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return res.json({ error: "User not found" });

  // If profile visibility is toggled off, return minimal private profile info
  const prefs = data.preferences || {};
  if (prefs.profileVisible === false) {
    return res.json({
      user: {
        id: data.id,
        email: "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        avatar_url: data.avatar_url || null,
      }
    });
  }

  res.json({
    user: {
      id: data.id,
      email: "",
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      firstName: data.first_name || "",
      lastName: data.last_name || "",
      avatar_url: data.avatar_url || null,
      bio: data.bio || "",
      skills: data.skills || [],
      rating: data.rating || null,
      jobs_completed: data.jobs_completed || 0,
      created_at: data.created_at,
      zip: data.zip || "",
      identity_verified: data.identity_verified || false,
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

  // Only expose address to the poster or the hired worker
  let job = { ...data };
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      const isPoster = user?.id === data.poster_id;
      const isHiredWorker = user?.id === data.worker_id && data.status === "booked";
      if (!isPoster && !isHiredWorker) delete job.address;
    } catch { delete job.address; }
  } else {
    delete job.address;
  }

  res.json({ job });
});


// Edit a job (poster only, only if status is still "open")
app.patch("/api/jobs/:id", requireAuth, async (req, res) => {
  const { title, description, category, pay, zip, lat, lng, date, date_iso, duration, photos } = req.body;
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
  if (date_iso !== undefined) updates.date_iso = date_iso;
  if (duration !== undefined) updates.duration = duration;
  if (photos !== undefined) updates.photos = photos;

  const profanityErr = checkJobProfanity(updates.title, updates.description);
  if (profanityErr) return res.json({ error: profanityErr });

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

// Profanity filter — comprehensive list + leet speak / evasion detection
const BANNED_WORDS = new Set([
  // F-word variants
  "fuck","fucker","fuckers","fuckin","fucking","fucks","fucked","fuckoff",
  "fuckhead","fuckface","fuckwit","fuckboy","fuckboi","motherfucker",
  "motherfucking","motherfuckers","clusterfuck","mindfuck",
  // S-word variants
  "shit","shits","shitty","shitting","shitter","shithead","shitface",
  "shithole","bullshit","horseshit","dipshit","batshit","apeshit",
  // A-word variants
  "ass","asses","asshole","assholes","asshat","asswipe","assface",
  "assclown","badass","dumbass","fatass","jackass","kickass","smartass",
  "bitchass","lardass",
  // B-word variants
  "bitch","bitches","bitchy","bitching","sonofabitch",
  // C-word variants
  "cunt","cunts","cuntface",
  // D-word variants
  "dick","dicks","dickhead","dickface","dickweed","dickbag",
  "cock","cocks","cocksucker","cocksucking","cockhead",
  // P-word variants
  "pussy","pussies","pussyass",
  // Slurs — racial
  "nigger","niggers","nigga","niggas","nigg","nig",
  "chink","chinks","gook","gooks","spic","spics","spick",
  "wetback","wetbacks","beaner","beaners","kike","kikes",
  "coon","coons","darkie","darkies","raghead","ragheads",
  "towelhead","towelheads","redskin","redskins","injun",
  "chinaman","jap","japs","paki","pakis",
  // Slurs — sexuality/gender
  "fag","fags","faggot","faggots","faggy","dyke","dykes",
  "tranny","trannies","shemale","shemales","homo","homos",
  // Slurs — disability
  "retard","retards","retarded","tard","tards","spaz","spastic",
  "cripple",
  // Sexual/crude
  "slut","sluts","slutty","whore","whores","skank","skanks","skanky",
  "hoe","thot","milf","dilf","dildo","blowjob","handjob","rimjob",
  "cumshot","creampie","gangbang","orgy","porn","porno",
  "jizz","cum","cumming","semen","boner","erection",
  "tits","titties","titty","boobs","boobies","nudes","nude",
  "masturbate","masturbation","wank","wanker","wanking","jerkoff",
  // Drug references
  "crackhead","tweaker","meth","heroin","cocaine","crack",
  // Violence
  "kill","murder","rape","raping","rapist","molest","pedophile",
  "pedo","kidnap",
  // General insults
  "bastard","bastards","douche","douchebag","douchebags",
  "piss","pissed","pissoff","scumbag","scum","trashy",
  "stfu","gtfo","kys","ligma","deez",
]);

// Normalize leet speak and evasion tricks
function normalizeLeet(text) {
  return text
    .replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t")
    .replace(/8/g, "b").replace(/9/g, "g").replace(/@/g, "a")
    .replace(/\$/g, "s").replace(/!/g, "i").replace(/\+/g, "t")
    .replace(/ph/g, "f")
    // Remove repeated chars (fuuuck -> fuck, shiiit -> shit)
    .replace(/(.)\1{2,}/g, "$1$1")
    // Remove separators used to evade (f.u.c.k, f-u-c-k, f_u_c_k)
    .replace(/[\.\-_*~`']+/g, "");
}

function containsProfanity(text) {
  if (!text) return false;
  const normalized = normalizeLeet(text.toLowerCase());
  // Check whole words
  const words = normalized.replace(/[^a-z\s]/g, "").split(/\s+/);
  if (words.some(w => BANNED_WORDS.has(w))) return true;
  // Check substrings for concatenated slurs (e.g. "fuckthis", "gokillyourself")
  const stripped = normalized.replace(/[^a-z]/g, "");
  for (const banned of BANNED_WORDS) {
    if (banned.length >= 4 && stripped.includes(banned)) return true;
  }
  return false;
}

function checkJobProfanity(title, description) {
  if (containsProfanity(title)) return "Job title contains inappropriate language. Please revise.";
  if (containsProfanity(description)) return "Job description contains inappropriate language. Please revise.";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTOMATED EMAILS
// ─────────────────────────────────────────────────────────────────────────────

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Chores <hello@choresnearme.com>", to: [to], subject, html })
    });
  } catch (e) { console.warn("Email send failed:", e.message); }
}

function emailTemplate(content) {
  return `
  <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:0;background:#F8F4EF;">
    <div style="background:#1B4332;padding:28px 32px;text-align:center;">
      <span style="font-family:Georgia,serif;font-size:28px;font-weight:800;color:#fff;">Chores</span><span style="font-family:Georgia,serif;font-size:28px;font-weight:800;color:#52B788;">.</span>
    </div>
    <div style="padding:32px;background:#fff;">
      ${content}
    </div>
    <div style="padding:20px 32px;text-align:center;font-size:11px;color:#9CA3AF;">
      <p>Chores App LLC · <a href="https://choresnearme.com" style="color:#2D6A4F;">choresnearme.com</a></p>
      <p style="margin-top:8px;"><a href="https://choresnearme.com/privacy" style="color:#9CA3AF;">Privacy Policy</a> · <a href="https://choresnearme.com/terms" style="color:#9CA3AF;">Terms</a></p>
    </div>
  </div>`;
}

async function sendWelcomeEmail(email, firstName, role) {
  const name = firstName || "there";
  const isWorker = role === "worker";
  const subject = `Welcome to Chores, ${name}! 🎉`;
  const html = emailTemplate(`
    <h2 style="color:#1B4332;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Welcome to Chores, ${name}!</h2>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
      You're all set. ${isWorker
        ? "Jobs are being posted every day by people in your area who need help. Browse, apply, and start earning."
        : "You can now post jobs and connect with trusted workers in your neighborhood. Payments are protected by escrow."}
    </p>
    <div style="background:#D8F3DC;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="font-weight:700;color:#1B4332;margin:0 0 8px;font-size:14px;">Here's how to get started:</p>
      <p style="color:#2D6A4F;font-size:14px;line-height:1.8;margin:0;">
        ${isWorker
          ? "1. Browse jobs on the Home tab<br>2. Apply with a message to the poster<br>3. Get hired and earn money securely"
          : "1. Tap 'Post a New Job' on the Home tab<br>2. Set your price, date, and details<br>3. Review applicants and hire someone"}
      </p>
    </div>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Every payment is held in escrow until the job is done — so ${isWorker ? "you always get paid" : "your money is safe"}.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://choresnearme.com/download" style="background:#1B4332;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">Open Chores →</a>
    </div>
    <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Questions? Reply to this email or tap Support in the app.</p>
  `);
  await sendEmail(email, subject, html);
  console.log(`📧 Welcome email sent to ${email}`);
}

// Drip email: sent 3 days after signup to inactive users
async function sendDripEmails() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();

  // Find users who signed up 3-4 days ago
  const { data: users } = await supabase
    .from("users")
    .select("id, email, first_name, role, jobs_completed")
    .lt("created_at", threeDaysAgo)
    .gt("created_at", fourDaysAgo);

  if (!users || users.length === 0) return;

  for (const user of users) {
    // Skip if they've already completed a job
    if (user.jobs_completed > 0) continue;

    const name = user.first_name || "there";
    const isWorker = user.role === "worker";

    const subject = isWorker
      ? `${name}, jobs are waiting for you 👀`
      : `${name}, post your first job — it takes 30 seconds`;

    const html = emailTemplate(`
      <h2 style="color:#1B4332;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Hey ${name},</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
        ${isWorker
          ? "People in your area are posting jobs right now — lawn care, cleaning, moving, pet care, and more. Don't miss out on earning opportunities."
          : "Need something done around the house? Post a job in 30 seconds and get applications from workers in your area. Payments are protected by escrow — you only pay when the job is done."}
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://choresnearme.com/download" style="background:#1B4332;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">${isWorker ? "Browse Jobs →" : "Post a Job →"}</a>
      </div>
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">You're receiving this because you signed up for Chores. <a href="https://choresnearme.com" style="color:#9CA3AF;">Unsubscribe</a></p>
    `);

    await sendEmail(user.email, subject, html);
    console.log(`📧 Drip email sent to ${user.email}`);
    // Rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
}

// Referral drip: 2 days after signup, nudge users who haven't completed a job
async function sendReferralDrip() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: users } = await supabase
    .from("users")
    .select("id, email, first_name, referral_code, jobs_completed")
    .lt("created_at", twoDaysAgo)
    .gt("created_at", threeDaysAgo)
    .not("referral_code", "is", null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (user.jobs_completed > 0) continue;

    const name = user.first_name || "there";
    const code = user.referral_code || "";

    const subject = `${name}, invite a neighbor and earn $10`;
    const html = emailTemplate(`
      <h2 style="color:#1B4332;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Hey ${name},</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Know someone who could use help around the house — or someone looking to earn extra money? Share your referral code and you'll both get <strong>$10 credit</strong> when they complete their first job.
      </p>
      <div style="background:#D8F3DC;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="font-size:12px;font-weight:700;color:#2D6A4F;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your referral code</p>
        <p style="font-family:monospace;font-size:28px;font-weight:900;color:#1B4332;margin:0;letter-spacing:3px;">${code}</p>
      </div>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Just share your code with a friend or neighbor. When they sign up and complete their first job, you both earn $10 — it's that simple.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://choresnearme.com/download" style="background:#1B4332;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">Open Chores →</a>
      </div>
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">You're receiving this because you signed up for Chores. <a href="https://choresnearme.com" style="color:#9CA3AF;">Unsubscribe</a></p>
    `);

    await sendEmail(user.email, subject, html);

    // Also send push notification
    notify(user.id, {
      type: "referral",
      category: "referral",
      icon: "gift.fill",
      title: "Invite a neighbor, earn $10",
      body: `Share your code ${code} with a friend. You both get $10 credit when they complete their first job.`
    }).catch(() => {});

    console.log(`📧 Referral drip sent to ${user.email} (code: ${code})`);
    await new Promise(r => setTimeout(r, 1000));
  }
}

// Run drip emails daily at ~9am
setInterval(sendDripEmails, 24 * 60 * 60 * 1000);
setInterval(sendReferralDrip, 24 * 60 * 60 * 1000);
// Also run once on startup (checks for eligible users)
setTimeout(sendDripEmails, 30000);
setTimeout(sendReferralDrip, 35000);

// Post a new job (poster only)
app.post("/api/jobs/create", requireAuth, async (req, res) => {
  const { title, description, category, pay, zip, lat, lng, date, date_iso, duration, photos, address } = req.body;
  console.log("📋 Creating job:", { title, category, pay, zip, userId: req.user.id });

  if (!title || !pay) return res.json({ error: "Title and pay are required" });

  const profanityErr = checkJobProfanity(title, description);
  if (profanityErr) return res.json({ error: profanityErr });

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

  // Geocode address server-side if client didn't provide lat/lng
  let jobLat = lat || null;
  let jobLng = lng || null;
  if (!jobLat && !jobLng && address) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const geoRes = await fetch(geoUrl, { headers: { "User-Agent": "ChoresApp/1.0" } });
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        jobLat = parseFloat(geoData[0].lat);
        jobLng = parseFloat(geoData[0].lon);
        console.log("📍 Geocoded address:", address, "→", jobLat, jobLng);
      }
    } catch (e) { console.log("⚠️ Geocode failed:", e.message); }
  }

  const { data, error } = await supabase.from("jobs").insert({
    poster_id: req.user.id,
    title: title.trim(),
    description: description || null,
    category: category || null,
    pay: parseFloat(pay),
    zip: zip || null,
    lat: jobLat,
    lng: jobLng,
    date: date || null,
    date_iso: date_iso || null,
    duration: duration || null,
    address: address || null,
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

  const { error: updateErr } = await supabase.from("jobs").update({ status: "archived" }).eq("id", req.params.id);
  if (updateErr) {
    console.error("❌ Archive error:", updateErr.message);
    // Fallback to cancelled if archived status not supported
    await supabase.from("jobs").update({ status: "cancelled" }).eq("id", req.params.id);
  }

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

// Restore an archived job (within 7 days)
app.post("/api/jobs/:id/restore", requireAuth, async (req, res) => {
  const { data: job } = await supabase
    .from("jobs").select("poster_id, status, updated_at").eq("id", req.params.id).single();
  if (!job) return res.json({ error: "Job not found" });
  if (job.poster_id !== req.user.id) return res.json({ error: "Not authorized" });
  if (job.status !== "archived") return res.json({ error: "Job is not archived" });

  // Check 7-day window
  if (job.updated_at) {
    const archivedDate = new Date(job.updated_at);
    const daysSince = (Date.now() - archivedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) return res.json({ error: "Archive period expired — job has been permanently deleted" });
  }

  await supabase.from("jobs").update({ status: "open" }).eq("id", req.params.id);
  console.log("♻️ Job restored:", req.params.id);
  res.json({ success: true });
});

// Permanently delete jobs archived > 7 days (called on any jobs fetch)
async function purgeExpiredArchives() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase.from("jobs").select("id").eq("status", "archived").lt("updated_at", cutoff);
  if (data && data.length > 0) {
    const ids = data.map(j => j.id);
    await supabase.from("applications").delete().in("job_id", ids);
    await supabase.from("jobs").delete().in("id", ids);
    console.log(`🗑️ Purged ${ids.length} expired archived jobs`);
  }
}
// Run purge on startup and every hour
purgeExpiredArchives();
setInterval(purgeExpiredArchives, 60 * 60 * 1000);

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS — Escrow hold, release, refund
// ─────────────────────────────────────────────────────────────────────────────

// Fund escrow (poster books a worker — funds held, not released)
// Hire a worker for a job (poster action)
app.post("/api/jobs/:id/hire", requireAuth, async (req, res) => {
  const { workerId } = req.body;
  const jobId = req.params.id;
  if (!workerId) return res.json({ error: "workerId is required" });

  try {
    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
    if (!job) return res.json({ error: "Job not found" });
    if (job.poster_id !== req.user.id) return res.json({ error: "Only the poster can hire" });
    if (job.status === "booked") return res.json({ error: "Job is already booked" });

    // Update job: assign worker + set status to booked
    await supabase.from("jobs").update({ worker_id: workerId, status: "booked" }).eq("id", jobId);

    // Update application status
    await supabase.from("applications").update({ status: "accepted" }).eq("job_id", jobId).eq("worker_id", workerId);
    // Reject other applications
    await supabase.from("applications").update({ status: "declined" }).eq("job_id", jobId).neq("worker_id", workerId).eq("status", "pending");

    // Notify worker
    const { data: poster } = await supabase.from("users").select("first_name,last_name").eq("id", req.user.id).maybeSingle();
    const posterName = poster ? `${poster.first_name || ""} ${poster.last_name || ""}`.trim() : "The poster";
    await notify(workerId, {
      type: "accepted", category: "job", icon: "🎉",
      title: "You've been hired!",
      body: `${posterName} hired you for "${job.title}" · $${job.pay}`,
      jobId, relatedUserId: req.user.id,
    });

    // Send a message to the worker
    await supabase.from("messages").insert({
      sender_id: req.user.id,
      recipient_id: workerId,
      job_id: jobId,
      type: "hire",
      body: `${posterName} hired you for "${job.title}"! You can now coordinate details here.`,
      preview: `You've been hired for ${job.title}!`,
      read: false,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Hire error:", err);
    res.json({ error: err.message });
  }
});

app.post("/api/charge", requireAuth, async (req, res) => {
  const { paymentMethodId, jobId, workerId } = req.body;

  try {
    // Fetch job details
    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
    if (!job) return res.json({ error: "Job not found" });

    // Fetch poster — create Stripe customer on first payment if needed
    const { data: poster } = await supabase
      .from("users").select("stripe_customer_id, email, first_name, last_name, referral_credit").eq("id", req.user.id).single();

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

    // Apply referral credit if available
    const availableCredit = parseFloat(poster.referral_credit) || 0;
    const jobPayDollars = job.pay;
    const creditApplied = Math.min(availableCredit, jobPayDollars); // never exceed job price or available credit
    const chargeAmount = jobPayDollars - creditApplied;             // amount to charge via Stripe

    const totalCents = Math.round(chargeAmount * 100);              // poster pays reduced amount
    const feeCents = Math.round(Math.round(jobPayDollars * 100) * 0.15);  // 15% fee on full job price
    const workerCents = Math.round(jobPayDollars * 100) - feeCents;       // worker gets 85% of full price

    // Deduct credit from user's balance
    if (creditApplied > 0) {
      await supabase.from("users").update({
        referral_credit: Math.max(0, availableCredit - creditApplied),
      }).eq("id", req.user.id);
      console.log(`💳 Applied $${creditApplied.toFixed(2)} referral credit to job ${jobId}`);
    }

    // If credit covers the full amount, skip Stripe entirely
    if (totalCents <= 0) {
      // Create escrow record with no Stripe intent
      const { data: escrow } = await supabase.from("escrow").insert({
        job_id: jobId,
        poster_id: req.user.id,
        worker_id: workerId,
        amount: jobPayDollars,
        fee: jobPayDollars * 0.15,
        worker_gets: jobPayDollars * 0.85,
        stripe_intent_id: "credit_covered",
        status: "held",
      }).select().single();

      await supabase.from("jobs").update({ status: "booked", worker_id: workerId }).eq("id", jobId);

      const { data: posterUser } = await supabase.from("users").select("first_name,last_name").eq("id", req.user.id).maybeSingle();
      const posterName = posterUser ? `${posterUser.first_name} ${posterUser.last_name}`.trim() : "The poster";
      await notify(workerId, {
        type: "accepted", category: "job", icon: "✅",
        title: "Application accepted!",
        body: `${posterName} hired you for "${job.title}" · $${job.pay}`,
        jobId, relatedUserId: req.user.id,
      });
      await notify(req.user.id, {
        type: "payment", category: "payment", icon: "🎁",
        title: "Paid with referral credit",
        body: `$${creditApplied.toFixed(2)} credit applied · "${job.title}"`,
        jobId,
      });

      return res.json({ success: true, intentId: null, escrowId: escrow.id, creditApplied });
    }

    // Fetch worker's Connect ID
    const { data: worker } = await supabase
      .from("users").select("stripe_connect_id").eq("id", workerId).single();

    // Create PaymentIntent with manual capture (holds funds without charging yet)
    const intent = await stripe.paymentIntents.create({
      amount: totalCents,
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
        creditApplied: creditApplied.toFixed(2),
      },
      return_url: process.env.FRONTEND_URL || "https://choresnearme.com",
    });

    if (intent.status === "requires_action") {
      return res.json({ requiresAction: true, clientSecret: intent.client_secret, intentId: intent.id, creditApplied });
    }

    if (intent.status !== "requires_capture") {
      // Refund the credit if Stripe payment failed
      if (creditApplied > 0) {
        await supabase.from("users").update({
          referral_credit: availableCredit,
        }).eq("id", req.user.id);
      }
      return res.json({ error: "Payment failed — please try a different card." });
    }

    // Create escrow record in Supabase
    const { data: escrow } = await supabase.from("escrow").insert({
      job_id: jobId,
      poster_id: req.user.id,
      worker_id: workerId,
      amount: jobPayDollars,
      fee: jobPayDollars * 0.15,
      worker_gets: jobPayDollars * 0.85,
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

    res.json({ success: true, intentId: intent.id, escrowId: escrow.id, creditApplied });
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
    fee: e.fee || 0,
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

  // Include set of job IDs already reviewed by this user so frontend can suppress duplicate prompts
  const jobIds = transactions.map(t => t.jobId).filter(Boolean);
  let reviewedJobIds = [];
  if (jobIds.length > 0) {
    const { data: myReviews } = await supabase
      .from("reviews").select("job_id").eq("reviewer_id", userId).in("job_id", jobIds);
    reviewedJobIds = (myReviews || []).map(r => r.job_id);
  }

  res.json({ transactions, reviewedJobIds });
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

      // ── Referral credit trigger: check if this is someone's first completed job ──
      // Check both the worker and poster — either one completing their first job triggers referral credit
      for (const participantId of [escrow.worker_id, escrow.poster_id]) {
        try {
          const { data: participant } = await supabase
            .from("users").select("id, referred_by, email, first_name").eq("id", participantId).single();
          if (!participant?.referred_by) continue;

          // Check if their referral is still pending
          const { data: referral } = await supabase
            .from("referrals")
            .select("id, referrer_id, status, credit_amount")
            .eq("referred_id", participantId)
            .eq("status", "pending")
            .maybeSingle();
          if (!referral) continue;

          // This is their first job completion with a pending referral — award credit to both
          const creditAmount = referral.credit_amount || 10;

          // Credit the referred user
          const { data: referredUser } = await supabase
            .from("users").select("referral_credit").eq("id", participantId).single();
          await supabase.from("users").update({
            referral_credit: (parseFloat(referredUser?.referral_credit) || 0) + creditAmount,
          }).eq("id", participantId);

          // Credit the referrer and increment their count
          const { data: referrerUser } = await supabase
            .from("users").select("referral_credit, referrals_count, email, first_name").eq("id", referral.referrer_id).single();
          await supabase.from("users").update({
            referral_credit: (parseFloat(referrerUser?.referral_credit) || 0) + creditAmount,
            referrals_count: (referrerUser?.referrals_count || 0) + 1,
          }).eq("id", referral.referrer_id);

          // Mark referral as completed
          await supabase.from("referrals").update({
            status: "completed",
            completed_at: new Date().toISOString(),
          }).eq("id", referral.id);

          console.log(`🎁 Referral credit awarded: $${creditAmount} each to ${referral.referrer_id} and ${participantId}`);

          // Send email to the referrer
          const referrerName = referrerUser?.first_name || "there";
          const referredName = participant?.first_name || "Your referral";
          if (referrerUser?.email) {
            const referralEmailHtml = emailTemplate(`
              <h2 style="color:#1B4332;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">You earned $${creditAmount} credit!</h2>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
                Hey ${referrerName}, great news — ${referredName} just completed their first job on Chores! You both earned <strong>$${creditAmount} credit</strong>.
              </p>
              <div style="background:#D8F3DC;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="font-weight:700;color:#1B4332;margin:0 0 8px;font-size:14px;">Your referral credit: $${(parseFloat(referrerUser?.referral_credit) || 0) + creditAmount}</p>
                <p style="color:#2D6A4F;font-size:14px;line-height:1.8;margin:0;">
                  This credit will be applied automatically the next time you pay for a job.
                </p>
              </div>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Keep sharing your referral code to earn more!
              </p>
              <div style="text-align:center;margin:24px 0;">
                <a href="https://choresnearme.com/download" style="background:#1B4332;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">Open Chores →</a>
              </div>
            `);
            sendEmail(referrerUser.email, `${referredName} completed their first job — you earned $${creditAmount}!`, referralEmailHtml).catch(e => console.warn("Referral email failed:", e.message));
          }

          // Notify both in-app
          await notify(referral.referrer_id, {
            type: "referral", category: "payment", icon: "🎁",
            title: "Referral bonus earned!",
            body: `${referredName} completed their first job — you both earned $${creditAmount} credit`,
            relatedUserId: participantId,
          });
          await notify(participantId, {
            type: "referral", category: "payment", icon: "🎁",
            title: "Referral bonus earned!",
            body: `You completed your first job — you and your referrer both earned $${creditAmount} credit`,
            relatedUserId: referral.referrer_id,
          });
        } catch (refErr) {
          console.error("Referral credit error (non-fatal):", refErr.message);
        }
      }

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
      .from("users").select("stripe_customer_id, referral_credit").eq("id", req.user.id).single();
    if (!user?.stripe_customer_id) return res.json({ error: "No saved payment method found." });

    // Fetch job for pay amount
    const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
    if (!job) return res.json({ error: "Job not found" });

    // Apply referral credit if available
    const availableCredit = parseFloat(user.referral_credit) || 0;
    const creditApplied = Math.min(availableCredit, job.pay);
    const chargeAmount = job.pay - creditApplied;

    if (creditApplied > 0) {
      await supabase.from("users").update({
        referral_credit: Math.max(0, availableCredit - creditApplied),
      }).eq("id", req.user.id);
      console.log(`💳 Applied $${creditApplied.toFixed(2)} referral credit to job ${jobId} (charge-saved)`);
    }

    const totalCents = Math.round(chargeAmount * 100);
    const feeCents = Math.round(Math.round(job.pay * 100) * 0.15);
    const workerCents = Math.round(job.pay * 100) - feeCents;

    // If credit covers the full amount, skip Stripe
    if (totalCents <= 0) {
      await supabase.from("escrow").insert({
        job_id: jobId,
        poster_id: req.user.id,
        worker_id: workerId || null,
        amount: job.pay,
        fee: job.pay * 0.15,
        worker_gets: job.pay * 0.85,
        stripe_intent_id: "credit_covered",
        status: "held",
      });
      if (workerId) {
        await supabase.from("jobs").update({ status: "booked", worker_id: workerId }).eq("id", jobId);
        const { data: posterUser } = await supabase.from("users").select("first_name,last_name").eq("id", req.user.id).maybeSingle();
        const posterName = posterUser ? `${posterUser.first_name} ${posterUser.last_name}`.trim() : "The poster";
        await notify(workerId, {
          type: "accepted", category: "job", icon: "✅",
          title: "You've been hired!",
          body: `${posterName} hired you for "${job.title}" · $${job.pay} in escrow`,
          jobId, relatedUserId: req.user.id,
        });
      }
      return res.json({ success: true, intentId: null, creditApplied });
    }

    const intent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      payment_method: paymentMethodId,
      customer: user.stripe_customer_id,
      confirm: true,
      capture_method: "manual",
      off_session: true,
      metadata: { jobId, posterId: req.user.id, workerId: workerId || "", creditApplied: creditApplied.toFixed(2) },
      return_url: process.env.FRONTEND_URL || "https://choresnearme.com",
    });

    if (intent.status === "requires_action") {
      return res.json({ requiresAction: true, clientSecret: intent.client_secret, intentId: intent.id, creditApplied });
    }
    if (intent.status !== "requires_capture") {
      // Refund credit if Stripe failed
      if (creditApplied > 0) {
        await supabase.from("users").update({ referral_credit: availableCredit }).eq("id", req.user.id);
      }
      return res.json({ error: "Payment failed — please try a different card." });
    }

    // Create escrow record
    await supabase.from("escrow").insert({
      job_id: jobId,
      poster_id: req.user.id,
      worker_id: workerId || null,
      amount: job.pay,
      fee: job.pay * 0.15,
      worker_gets: job.pay * 0.85,
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

    res.json({ success: true, intentId: intent.id, creditApplied });
  } catch (err) {
    console.error("charge-saved error:", err.message);
    res.json({ error: err.message });
  }
});

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
// DISPUTE — Freeze escrow and flag for admin review
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/escrow/:id/dispute", requireAuth, async (req, res) => {
  const { reason } = req.body;
  const { data: escrow } = await supabase
    .from("escrow").select("*").eq("id", req.params.id).single();

  if (!escrow) return res.json({ error: "Escrow not found" });

  const isPoster = escrow.poster_id === req.user.id;
  const isWorker = escrow.worker_id === req.user.id;
  if (!isPoster && !isWorker) return res.json({ error: "Not authorized" });
  if (escrow.status !== "held") return res.json({ error: "Can only dispute held escrow" });

  // Update escrow status to disputed
  await supabase.from("escrow").update({
    status: "disputed",
    dispute_reason: reason || null,
    dispute_opened_by: req.user.id,
    dispute_opened_at: new Date().toISOString(),
  }).eq("id", req.params.id);

  // Update job status
  await supabase.from("jobs").update({ status: "disputed" }).eq("id", escrow.job_id);

  // Get job title for notifications
  const { data: disputedJob } = await supabase.from("jobs").select("title").eq("id", escrow.job_id).maybeSingle();
  const jobTitle = disputedJob?.title || "the job";

  // Notify both parties
  const otherUserId = isPoster ? escrow.worker_id : escrow.poster_id;
  const { data: opener } = await supabase.from("users").select("first_name,last_name").eq("id", req.user.id).maybeSingle();
  const openerName = opener ? `${opener.first_name} ${opener.last_name}`.trim() : "The other party";

  await notify(otherUserId, {
    type: "disputed", category: "alert", icon: "⚠️",
    title: "Dispute opened",
    body: `${openerName} opened a dispute on "${jobTitle}" · Under review`,
    jobId: escrow.job_id, relatedUserId: req.user.id,
  });
  await notify(req.user.id, {
    type: "disputed", category: "alert", icon: "⚠️",
    title: "Dispute submitted",
    body: `Your dispute on "${jobTitle}" is under review · We'll respond within 24 hours`,
    jobId: escrow.job_id,
  });

  // Email support team about the dispute
  await sendSupportEmail(`[Dispute] ${jobTitle}`, `Dispute opened by ${openerName} (${req.user.id})\nEscrow ID: ${req.params.id}\nJob: ${jobTitle}\nAmount: $${escrow.amount}\nReason: ${reason || "Not specified"}`);

  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.json({ error: "Both current and new password are required" });
  if (newPassword.length < 8) return res.json({ error: "New password must be at least 8 characters" });

  try {
    // Verify current password by attempting a sign-in
    const { data: profile } = await supabase.from("users").select("email").eq("id", req.user.id).single();
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
    console.error("Change password error:", err);
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD (sends Supabase reset email)
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ error: "Email is required" });

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || "https://app.choresnearme.com"}/?reset=true`,
    });
    if (error) return res.json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD — Apply new password using recovery access token
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/auth/reset-password", async (req, res) => {
  const { accessToken, newPassword } = req.body;
  if (!accessToken || !newPassword) return res.json({ error: "Missing fields" });
  if (newPassword.length < 8) return res.json({ error: "Password must be at least 8 characters" });
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) return res.json({ error: "Invalid or expired reset link" });
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
    if (error) return res.json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT DATA — Package all user data as JSON
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/auth/export-data", requireAuth, async (req, res) => {
  const uid = req.user.id;
  try {
    const [profileRes, jobsRes, messagesRes, reviewsRes, escrowRes, notifsRes] = await Promise.all([
      supabase.from("users").select("*").eq("id", uid).single(),
      supabase.from("jobs").select("*").or(`poster_id.eq.${uid},worker_id.eq.${uid}`).order("created_at", { ascending: false }),
      supabase.from("messages").select("*").or(`sender_id.eq.${uid},recipient_id.eq.${uid}`).order("created_at", { ascending: false }).limit(500),
      supabase.from("reviews").select("*").or(`reviewer_id.eq.${uid},reviewee_id.eq.${uid}`).order("created_at", { ascending: false }),
      supabase.from("escrow").select("*").or(`poster_id.eq.${uid},worker_id.eq.${uid}`).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(200),
    ]);

    // Strip sensitive fields
    const profile = profileRes.data || {};
    delete profile.stripe_customer_id;
    delete profile.stripe_connect_id;

    res.json({
      exportedAt: new Date().toISOString(),
      profile,
      jobs: jobsRes.data || [],
      messages: (messagesRes.data || []).map(m => ({ ...m, body: m.sender_id === uid ? m.body : "[received message]" })),
      reviews: reviewsRes.data || [],
      escrow: escrowRes.data || [],
      notifications: notifsRes.data || [],
    });
  } catch (err) {
    console.error("Export data error:", err);
    res.json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PAYOUT SCHEDULE — Save worker payout preferences
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/user/payout-schedule", requireAuth, async (req, res) => {
  // Accept both naming conventions: (frequency, day) from web and (interval, weekly_anchor) from iOS
  const frequency = req.body.frequency || req.body.interval;
  const day = req.body.day || req.body.weekly_anchor;
  if (!["daily", "weekly", "biweekly", "monthly"].includes(frequency)) return res.json({ error: "Invalid frequency" });

  // Map day name to Stripe's expected values
  const dayMap = { Monday: "monday", Tuesday: "tuesday", Wednesday: "wednesday", Thursday: "thursday", Friday: "friday" };

  try {
    // Get user's Stripe Connect account
    const { data: user } = await supabase.from("users")
      .select("stripe_connect_id")
      .eq("id", req.user.id).single();

    if (user?.stripe_connect_id) {
      // Build Stripe payout schedule settings
      const scheduleParams = {};
      if (frequency === "daily") {
        scheduleParams.interval = "daily";
      } else if (frequency === "weekly") {
        scheduleParams.interval = "weekly";
        scheduleParams.weekly_anchor = dayMap[day] || "friday";
      } else if (frequency === "biweekly") {
        // Stripe doesn't have biweekly — use weekly as closest match
        scheduleParams.interval = "weekly";
        scheduleParams.weekly_anchor = dayMap[day] || "friday";
      } else if (frequency === "monthly") {
        scheduleParams.interval = "monthly";
        scheduleParams.monthly_anchor = 1;
      }

      await stripe.accounts.update(user.stripe_connect_id, {
        settings: {
          payouts: {
            schedule: scheduleParams,
          },
        },
      });
    }

    // Save to our DB too
    const { error } = await supabase.from("users").update({
      payout_frequency: frequency,
      payout_day: day || null,
    }).eq("id", req.user.id);
    if (error) return res.json({ error: error.message });

    res.json({ success: true });
  } catch (err) {
    console.error("Payout schedule error:", err.message);
    // If Stripe fails (e.g. no Connect account yet), still save locally
    const { error } = await supabase.from("users").update({
      payout_frequency: frequency,
      payout_day: day || null,
    }).eq("id", req.user.id);
    if (error) return res.json({ error: error.message });
    res.json({ success: true, stripeWarning: "Saved locally — Stripe payout schedule will sync once your payout account is set up." });
  }
});

app.get("/api/user/payout-schedule", requireAuth, async (req, res) => {
  const { data, error } = await supabase.from("users")
    .select("payout_frequency, payout_day, stripe_connect_id")
    .eq("id", req.user.id).maybeSingle();
  if (error) return res.json({ error: error.message });

  let stripeSchedule = null;
  // Fetch live schedule from Stripe if Connect account exists
  if (data?.stripe_connect_id) {
    try {
      const account = await stripe.accounts.retrieve(data.stripe_connect_id);
      const sched = account.settings?.payouts?.schedule;
      if (sched) {
        stripeSchedule = {
          interval: sched.interval,
          weeklyAnchor: sched.weekly_anchor || null,
          monthlyAnchor: sched.monthly_anchor || null,
        };
      }
    } catch (e) { /* non-fatal */ }
  }

  const freq = data?.payout_frequency || "weekly";
  const dayVal = data?.payout_day || "friday";
  res.json({
    frequency: freq,
    day: dayVal,
    // iOS-compatible fields
    interval: freq,
    weekly_anchor: dayVal.toLowerCase(),
    stripeSchedule,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER PREFERENCES — Save notification/privacy toggles to backend
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/user/preferences", requireAuth, async (req, res) => {
  const { preferences } = req.body;
  if (!preferences || typeof preferences !== "object") return res.json({ error: "Invalid preferences" });
  const { error } = await supabase.from("users").update({ preferences }).eq("id", req.user.id);
  if (error) return res.json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/user/preferences", requireAuth, async (req, res) => {
  const { data, error } = await supabase.from("users")
    .select("preferences")
    .eq("id", req.user.id).maybeSingle();
  if (error) return res.json({ error: error.message });
  res.json({ preferences: data?.preferences || null });
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
    const clientReturnUrl = req.body.returnUrl;
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: clientReturnUrl || `${frontendUrl}/?connect=refresh`,
      return_url:  clientReturnUrl || `${frontendUrl}/?connect=complete`,
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

// Stripe Express dashboard login link (for managing bank account)
app.post("/api/connect/dashboard", requireAuth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users").select("stripe_connect_id").eq("id", req.user.id).single();
    if (!user?.stripe_connect_id) return res.json({ error: "No Connect account found" });
    const loginLink = await stripe.accounts.createLoginLink(user.stripe_connect_id);
    res.json({ url: loginLink.url });
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
// EMAIL VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
// Codes are persisted in Supabase (table: email_verification_codes) so they
// survive backend restarts/redeploys/scaling. Email keys are normalized to
// lowercase + trimmed so casing/whitespace can never cause a lookup miss.
const normalizeEmail = (e) => (e || "").trim().toLowerCase();

app.post("/api/verify/email/send", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { name } = req.body;
  if (!email) return res.json({ error: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: dbError } = await supabase
    .from("email_verification_codes")
    .upsert(
      { email, code, expires_at: expiresAt, created_at: new Date().toISOString() },
      { onConflict: "email" }
    );

  if (dbError) {
    console.error("Failed to store verification code:", dbError);
    return res.json({ error: "Could not generate code — please try again" });
  }

  console.log(`📧 Email code for ${email}: ${code}`);

  // Send real email via Resend if API key is configured
  let emailStatus = "no_api_key";
  if (process.env.RESEND_API_KEY) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Chores <onboarding@resend.dev>",
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
      const resendData = await resendRes.json();
      console.log("📧 Resend response:", JSON.stringify(resendData));
      emailStatus = resendData.id ? "sent" : (resendData.message || "unknown_error");
    } catch (e) {
      console.error("Resend error:", e.message);
      emailStatus = e.message;
    }
  }

  res.json({ success: true, message: "Code sent", emailStatus, hasApiKey: !!process.env.RESEND_API_KEY });
});

app.post("/api/verify/email/check", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const code = (req.body.code || "").toString().trim();
  if (!email || !code) return res.json({ error: "Email and code are required" });

  const { data: record, error: dbError } = await supabase
    .from("email_verification_codes")
    .select("code, expires_at")
    .eq("email", email)
    .maybeSingle();

  if (dbError) {
    console.error("Failed to fetch verification code:", dbError);
    return res.json({ error: "Could not verify code — please try again" });
  }

  if (!record) return res.json({ error: "No code found — request a new one" });
  if (new Date() > new Date(record.expires_at)) {
    await supabase.from("email_verification_codes").delete().eq("email", email);
    return res.json({ error: "Code expired" });
  }
  if (record.code !== code) return res.json({ error: "Incorrect code" });

  await supabase.from("email_verification_codes").delete().eq("email", email);
  res.json({ success: true, verified: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/reviews/create", requireAuth, async (req, res) => {
  const { jobId, revieweeId, rating, comment, tags } = req.body;

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

  // Recalculate reviewee's average rating (mean of ALL reviews)
  const { data: allRevs } = await supabase
    .from("reviews").select("rating").eq("reviewee_id", revieweeId);
  if (allRevs && allRevs.length > 0) {
    const avg = allRevs.reduce((s, r) => s + r.rating, 0) / allRevs.length;
    await supabase.from("users").update({ rating: Math.round(avg * 10) / 10 }).eq("id", revieweeId);
  }

  res.json({ success: true });
});

// Get reviews for any user (public)
app.get("/api/reviews/user/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:users!reviewer_id(first_name, last_name, avatar_url), job:jobs(title)")
    .eq("reviewee_id", req.params.id)
    .order("created_at", { ascending: false });
  if (error) return res.json({ error: error.message });
  const reviews = (data || []).map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment || "",
    tags: r.tags || [],
    createdAt: r.created_at,
    jobTitle: r.job?.title || "",
    reviewerName: r.reviewer ? `${r.reviewer.first_name} ${r.reviewer.last_name}`.trim() : "Anonymous",
    reviewerAvatar: r.reviewer?.avatar_url || null,
  }));
  res.json({ reviews });
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
    related_user_id: n.related_user_id || null,
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

  // Check user's notification preferences before sending
  const { data: userData } = await supabase.from("users").select("preferences").eq("id", userId).maybeSingle();
  const prefs = userData?.preferences || {};

  // Master push toggle — if off, suppress everything
  if (prefs.push === false) return;

  // Per-type checks
  if (type === "applied"    && prefs.nApplicant === false) return;
  if (type === "complete"   && prefs.nComplete  === false) return;
  if (type === "rating"     && prefs.nRate      === false) return;
  if ((type === "cancelled" || type === "disputed") && prefs.nCancel === false) return;
  if (category === "payment" && type === "payment" && prefs.nPayment === false) return;
  if (category === "payment" && type !== "payment" && prefs.nReceipts === false) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type, category, icon, title, body,
    job_id: jobId || null,
    related_user_id: relatedUserId || null,
    read: false,
    created_at: new Date().toISOString(),
  });
  if (error) console.warn("⚠️  Notify error:", error.message);

  // Also send push notification
  pushToUser(userId, title, body, { type: type || "notification", jobId: jobId || "" }).catch(() => {});
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
    proposedPay: a.proposed_pay || null,
    appliedAt: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  res.json({ applicants });
});

app.post("/api/jobs/:id/apply", async (req, res) => {
  const { message, availability, workerId, workerName, proposedPay } = req.body;
  const jobId = req.params.id;
  console.log("📝 Application:", { jobId, workerId, workerName });

  if (!jobId || !workerId) return res.json({ error: "jobId and workerId are required" });
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
      proposed_pay: proposedPay ? parseFloat(proposedPay) : null,
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

    // 3. Write messages to create a conversation thread between worker and poster
    if (job?.poster_id) {
      // Worker → Poster: the application message
      const msgData = {
        sender_id: workerId,
        recipient_id: job.poster_id,
        job_id: jobId,
        body: proposedPay ? `${message}\n\n💰 Proposed price: $${parseFloat(proposedPay).toFixed(0)} (listed at $${job.pay})` : message,
        read: false,
        created_at: new Date().toISOString(),
      };
      const { error: msgErr } = await supabase.from("messages").insert(msgData);
      if (msgErr) {
        console.warn("⚠️ Message insert warning:", msgErr.message, msgErr.details);
      } else {
        console.log("✅ Application message created between", workerId, "→", job.poster_id);
      }

      // Poster → Worker: auto-reply so the worker also sees the thread in their inbox
      const { data: posterInfo } = await supabase.from("users").select("first_name,last_name").eq("id", job.poster_id).maybeSingle();
      const posterName = posterInfo ? `${posterInfo.first_name || ""} ${posterInfo.last_name || ""}`.trim() : "The poster";
      const autoReply = `Thanks for applying to "${job.title}"! I'll review your application and get back to you soon.`;
      const replyData = {
        sender_id: job.poster_id,
        recipient_id: workerId,
        job_id: jobId,
        body: autoReply,
        read: false,
        created_at: new Date(Date.now() + 1000).toISOString(),
      };
      const { error: replyErr } = await supabase.from("messages").insert(replyData);
      if (replyErr) console.warn("⚠️ Auto-reply insert warning:", replyErr.message, replyErr.details);

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
    .select("*, job:jobs(id,title), sender:users!sender_id(id,first_name,last_name,avatar_url), recipient:users!recipient_id(id,first_name,last_name,avatar_url)")
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
      const otherName = otherUser ? `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim() || "User" : "User";
      const msgPreview = m.preview || m.body?.slice(0, 80) || "";
      convMap[key] = {
        id: key,
        other_user_id: otherId,
        from: otherName,
        other_user_name: otherName,
        other_avatar: otherUser?.avatar_url || null,
        job: m.job?.title || "",
        job_id: m.job_id || null,
        job_title: m.job?.title || "",
        preview: msgPreview,
        last_message: msgPreview,
        time: timeAgo(m.created_at),
        unread: !m.read && m.recipient_id === uid,
        latest_at: m.created_at,
        last_at: m.created_at,
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
    .select("*, sender:users!sender_id(id,first_name,last_name,avatar_url)")
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
    sender_id: m.sender_id,
    from_me: m.sender_id === uid,
    sender_name: m.sender ? `${m.sender.first_name || ""} ${m.sender.last_name || ""}`.trim() : "User",
    sender_avatar: m.sender?.avatar_url || null,
    text: m.body || m.preview || "",
    body: m.body || m.preview || "",
    time: timeAgo(m.created_at),
    created_at: m.created_at,
    type: m.type,
  }));

  res.json({ messages: thread, thread });
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

  // Send push notification for new message
  pushToUser(recipientId, senderName, body.length > 100 ? body.slice(0, 97) + "..." : body, { type: "message" }).catch(() => {});

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
        from: "Chores <hello@choresnearme.com>",
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



// ─────────────────────────────────────────────────────────────────────────────
// REPORTS & BLOCKING (Apple Guideline 1.2 — User-Generated Content Safety)
// ─────────────────────────────────────────────────────────────────────────────

// Report objectionable content or abusive user
app.post("/api/reports/create", requireAuth, async (req, res) => {
  try {
    const { reportedUserId, reason, details, contentType } = req.body;
    if (!reportedUserId || !reason) return res.status(400).json({ error: "reportedUserId and reason are required" });

    const reporterId = req.user.id;

    // Store the report
    const { error } = await supabase.from("reports").insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      details: details || "",
      content_type: contentType || "user",
      status: "pending",
      created_at: new Date().toISOString()
    });
    if (error) console.error("Report insert error:", error);

    // Email the admin about the report
    const reporter = await supabase.from("users").select("email, first_name, last_name").eq("id", reporterId).maybeSingle();
    const reported = await supabase.from("users").select("email, first_name, last_name").eq("id", reportedUserId).maybeSingle();
    const reporterName = reporter?.data ? `${reporter.data.first_name || ""} ${reporter.data.last_name || ""}`.trim() : reporterId;
    const reportedName = reported?.data ? `${reported.data.first_name || ""} ${reported.data.last_name || ""}`.trim() : reportedUserId;

    await sendSupportEmail(
      `🚨 [Report] ${reason} — ${reportedName}`,
      `Reporter: ${reporterName} (${reporter?.data?.email || reporterId})
Reported User: ${reportedName} (${reported?.data?.email || reportedUserId})
Reason: ${reason}
Content Type: ${contentType || "user"}
Details: ${details || "None provided"}
Time: ${new Date().toISOString()}

⚠️ Apple requires action within 24 hours. Review and take appropriate action.`
    );

    console.log(`🚨 Report: ${reporterName} reported ${reportedName} for ${reason}`);
    res.json({ success: true });
  } catch (e) {
    console.error("Report error:", e);
    res.json({ success: true }); // Don't fail the client even if storage fails
  }
});

// Block a user
app.post("/api/users/:id/block", requireAuth, async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;

    // Upsert to avoid duplicates
    const { error } = await supabase.from("blocked_users").upsert({
      blocker_id: blockerId,
      blocked_id: blockedId,
      created_at: new Date().toISOString()
    }, { onConflict: "blocker_id,blocked_id" });
    if (error) console.error("Block insert error:", error);

    // Notify admin
    const blocker = await supabase.from("users").select("email, first_name, last_name").eq("id", blockerId).maybeSingle();
    const blocked = await supabase.from("users").select("email, first_name, last_name").eq("id", blockedId).maybeSingle();
    const blockerName = blocker?.data ? `${blocker.data.first_name || ""} ${blocker.data.last_name || ""}`.trim() : blockerId;
    const blockedName = blocked?.data ? `${blocked.data.first_name || ""} ${blocked.data.last_name || ""}`.trim() : blockedId;

    await sendSupportEmail(
      `🚫 [Block] ${blockerName} blocked ${blockedName}`,
      `${blockerName} (${blocker?.data?.email || blockerId}) blocked ${blockedName} (${blocked?.data?.email || blockedId}).
Time: ${new Date().toISOString()}

This may indicate abusive behavior. Consider reviewing the blocked user's activity.`
    );

    console.log(`🚫 Block: ${blockerName} blocked ${blockedName}`);
    res.json({ success: true });
  } catch (e) {
    console.error("Block error:", e);
    res.json({ success: true });
  }
});

// Unblock a user
app.post("/api/users/:id/unblock", requireAuth, async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;

    await supabase.from("blocked_users")
      .delete()
      .eq("blocker_id", blockerId)
      .eq("blocked_id", blockedId);

    console.log(`✅ Unblock: ${blockerId} unblocked ${blockedId}`);
    res.json({ success: true });
  } catch (e) {
    console.error("Unblock error:", e);
    res.json({ success: true });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

// Backfill missing lat/lng for existing jobs using their address or zip
app.delete("/api/admin/jobs/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  await supabase.from("applications").delete().eq("job_id", id);
  await supabase.from("escrow").delete().eq("job_id", id);
  await supabase.from("jobs").delete().eq("id", id);
  console.log("🗑️ Admin deleted job:", id);
  res.json({ success: true });
});

app.post("/api/admin/seed-jobs", requireAuth, requireAdmin, async (req, res) => {
  const { jobs } = req.body;
  if (!jobs || !Array.isArray(jobs)) return res.json({ error: "jobs array required" });
  const created = [];
  for (const j of jobs) {
    // Create a fake user for each job if name provided
    let posterId = req.user.id;
    if (j.posterName) {
      const parts = j.posterName.split(" ");
      const fakeEmail = `${parts.join(".").toLowerCase()}@demo.choresnearme.com`;
      const { data: existing } = await supabase.from("users").select("id").eq("email", fakeEmail).maybeSingle();
      if (existing) {
        posterId = existing.id;
      } else {
        const fakeId = require("crypto").randomUUID();
        await supabase.from("users").insert({
          id: fakeId, email: fakeEmail,
          first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "",
          role: "poster", rating: 4.5 + Math.random() * 0.5, jobs_completed: Math.floor(Math.random() * 10) + 1,
          created_at: new Date().toISOString(),
        });
        posterId = fakeId;
      }
    }
    const { data } = await supabase.from("jobs").insert({
      poster_id: posterId, title: j.title, description: j.description || null,
      category: j.category || null, pay: parseFloat(j.pay), zip: j.zip || "45056",
      lat: j.lat || null, lng: j.lng || null,
      date: j.date || null, date_iso: j.date_iso || null,
      duration: j.duration || null, address: j.address || null, status: "open", photos: [],
    }).select().single();
    if (data) created.push(data.id);
  }
  res.json({ success: true, created: created.length });
});

app.post("/api/admin/backfill-coords", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data: jobs } = await supabase.from("jobs").select("id, address, zip").or("lat.is.null,lng.is.null");
    if (!jobs || jobs.length === 0) return res.json({ updated: 0 });
    let updated = 0;
    for (const job of jobs) {
      const query = job.address || (job.zip ? `${job.zip}, United States` : null);
      if (!query) continue;
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const geoRes = await fetch(geoUrl, { headers: { "User-Agent": "ChoresApp/1.0" } });
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
          await supabase.from("jobs").update({ lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) }).eq("id", job.id);
          updated++;
          console.log(`📍 Backfilled ${job.id}: ${query} → ${geoData[0].lat}, ${geoData[0].lon}`);
        }
        // Rate limit: Nominatim requires 1 req/sec
        await new Promise(r => setTimeout(r, 1100));
      } catch (e) { console.log(`⚠️ Backfill failed for ${job.id}:`, e.message); }
    }
    res.json({ updated, total: jobs.length });
  } catch (err) { res.json({ error: err.message }); }
});

// ADMIN STATS
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: jobs } = await supabase.from("jobs").select("id, title, pay, zip, status, created_at").order("created_at", { ascending: false });
    const { data: users } = await supabase.from("users").select("id, first_name, last_name, role, email, created_at").order("created_at", { ascending: false });
    const { data: escrows } = await supabase.from("escrow").select("id, amount, fee, status, created_at, released_at").order("created_at", { ascending: false });

    const jobsArr = jobs || [];
    const usersArr = users || [];
    const escrowArr = escrows || [];

    const totalJobs = jobsArr.length;
    const openJobs = jobsArr.filter(j => j.status === "open").length;
    const completedJobs = jobsArr.filter(j => j.status === "completed").length;
    const totalWorkers = usersArr.filter(u => u.role === "worker").length;
    const totalPosters = usersArr.filter(u => u.role === "poster").length;
    const newUsersWeek = usersArr.filter(u => u.created_at && u.created_at >= weekAgo).length;
    const releasedEscrow = escrowArr.filter(e => e.status === "released");
    const completedToday = releasedEscrow.filter(e => e.released_at && e.released_at >= todayStr).length;
    const totalRevenue = releasedEscrow.reduce((s, e) => s + (parseFloat(e.fee) || 0), 0);
    const todayRevenue = releasedEscrow.filter(e => e.released_at && e.released_at >= todayStr).reduce((s, e) => s + (parseFloat(e.fee) || 0), 0);
    const avgFee = releasedEscrow.length ? totalRevenue / releasedEscrow.length : 0;
    const openDisputes = escrowArr.filter(e => e.status === "disputed").length;

    const zipCount = {};
    jobsArr.forEach(j => { if (j.zip) zipCount[j.zip] = (zipCount[j.zip] || 0) + 1; });
    const topZips = Object.entries(zipCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([zip, count]) => ({ zip, jobs: count }));

    const activity = [];
    jobsArr.slice(0, 8).forEach(j => {
      const ts = j.created_at ? new Date(j.created_at).getTime() : 0;
      if (j.status === "completed") activity.push({ icon: "✅", text: `Job completed · ${j.title || "Job"} · $${j.pay || 0}`, ts });
      else if (j.status === "open") activity.push({ icon: "📋", text: `Job posted · ${j.title || "Job"} · $${j.pay || 0}`, ts });
    });
    usersArr.slice(0, 6).forEach(u => {
      const ts = u.created_at ? new Date(u.created_at).getTime() : 0;
      activity.push({ icon: u.role === "poster" ? "🏠" : "👤", text: `New ${u.role || "user"} signup · ${((u.first_name || "") + " " + (u.last_name || "")).trim()}`, ts });
    });
    escrowArr.slice(0, 6).forEach(e => {
      const ts = e.created_at ? new Date(e.created_at).getTime() : 0;
      if (e.status === "released") activity.push({ icon: "💸", text: `Payment released · $${e.amount || 0}`, ts });
      else if (e.status === "disputed") activity.push({ icon: "⚖️", text: `Dispute opened · $${e.amount || 0}`, ts });
    });
    activity.sort((a, b) => b.ts - a.ts);

    const relTime = (ts) => {
      if (!ts) return "—";
      const diff = (Date.now() - ts) / 1000;
      if (diff < 60) return `${Math.floor(diff)}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}hr ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };

    res.json({
      totalJobs, openJobs, completedJobs, completedToday,
      totalWorkers, totalPosters, newUsersWeek,
      totalRevenue: +totalRevenue.toFixed(2),
      todayRevenue: +todayRevenue.toFixed(2),
      avgFee: +avgFee.toFixed(2),
      openDisputes, topZips,
      recentActivity: activity.slice(0, 15).map(a => ({ icon: a.icon, text: a.text, time: relTime(a.ts) })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
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
      // Update connect status for the user who owns this account
      const userId = account.metadata?.userId;
      if (userId) {
        await supabase.from("users")
          .update({ stripe_connect_id: account.id })
          .eq("id", userId);
      }
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object;
      console.log("✅ Payment succeeded:", intent.id);
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      console.log("❌ Payment failed:", intent.id);
      // Mark escrow as failed if it exists
      await supabase.from("escrow")
        .update({ status: "failed" })
        .eq("stripe_intent_id", intent.id)
        .eq("status", "pending");
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      console.log("↩️ Charge refunded:", charge.id);
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
// ── Push Notification: Device Token Registration ────────────────────────────
app.post("/api/push/register", requireAuth, async (req, res) => {
  const { deviceToken, platform } = req.body;
  if (!deviceToken) return res.json({ error: "deviceToken required" });

  const { error } = await supabase.from("device_tokens").upsert(
    { user_id: req.user.id, device_token: deviceToken, platform: platform || "ios", updated_at: new Date().toISOString() },
    { onConflict: "device_token" }
  );

  if (error) return res.json({ error: error.message });
  console.log(`[Push] Token registered for ${req.user.id.substring(0, 8)}...`);
  res.json({ success: true });
});

// Test push endpoint (development only)
app.post("/api/push/test", async (req, res) => {
  const { userId, title, body } = req.body;
  if (!userId) return res.json({ error: "userId required" });
  await pushToUser(userId, title || "Test", body || "This is a test push notification", { type: "test" });
  res.json({ success: true });
});

// ── Email Subscriber (landing page popup) ────────────────────────────────────
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body || {};

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Upsert into subscribers table (no error on duplicate)
    const { error } = await supabase
      .from("subscribers")
      .upsert(
        { email: cleanEmail, source: "website_popup" },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[subscribe] Supabase error:", error);
      return res.status(500).json({ error: "Failed to save subscriber" });
    }

    // Send welcome email via Resend
    const welcomeHtml = emailTemplate(`
      <h2 style="color:#1B4332;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">Welcome to the Chores community!</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Thanks for signing up. Chores connects people in St. Charles, Geneva, Batavia, and the Fox Valley who need everyday tasks done with neighbors happy to help.
      </p>
      <div style="background:#D8F3DC;border-radius:12px;padding:20px;margin:20px 0;">
        <p style="font-weight:700;color:#1B4332;margin:0 0 8px;font-size:14px;">What you can do with Chores:</p>
        <p style="color:#2D6A4F;font-size:14px;line-height:1.8;margin:0;">
          <strong>Need help?</strong> Post a task — lawn care, cleaning, moving, errands — and get matched with someone nearby.<br><br>
          <strong>Want to earn?</strong> Browse open jobs, set your own rates, and get paid securely through escrow.
        </p>
      </div>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Download the app to get started — it's free and takes two minutes.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://choresnearme.com/download" style="background:#1B4332;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">Download Chores →</a>
      </div>
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">You're receiving this because you signed up at choresnearme.com. <a href="https://choresnearme.com" style="color:#9CA3AF;">Unsubscribe</a></p>
    `);
    sendEmail(cleanEmail, "Welcome to Chores! 🏡", welcomeHtml).catch(e => console.warn("Subscriber welcome email failed:", e.message));

    console.log(`[subscribe] New subscriber: ${cleanEmail}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[subscribe] Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;

// Ensure address column exists on users table (safe to run repeatedly)
(async () => {
  try {
    await supabase.rpc("exec_sql", { sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT" });
    console.log("✅ Ensured address column exists on users table");
  } catch (e) {
    // If rpc doesn't exist, try a test query — column may already exist
    console.log("⚠️  Could not auto-migrate address column — add it manually in Supabase dashboard if needed:", e.message);
  }
})();

app.listen(PORT, () => console.log(`✅ ChoresApp backend running on port ${PORT}`));
