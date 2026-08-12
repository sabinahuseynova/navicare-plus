require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

// ---------- DATABASE SETUP ----------

pool.query(
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
  )`
).then(() => console.log("Users table ready"))
 .catch((err) => console.error("Error creating users table:", err));

pool.query(
  `CREATE TABLE IF NOT EXISTS help_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id),
    volunteer_id INTEGER REFERENCES users(id),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
  )`
).then(() => console.log("Help requests table ready"))
 .catch((err) => console.error("Error creating help_requests table:", err));

pool.query(
  `ALTER TABLE users
    ADD COLUMN IF NOT EXISTS age INTEGER,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS rating_avg NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT`
).then(() => console.log("User profile columns ready"))
 .catch((err) => console.error("Error altering users table:", err));

pool.query(
  `CREATE TABLE IF NOT EXISTS volunteer_certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuer TEXT,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`
).then(() => console.log("Volunteer certificates table ready"))
 .catch((err) => console.error("Error creating volunteer_certificates table:", err));

pool.query(
  `CREATE TABLE IF NOT EXISTS declined_requests (
    request_id INTEGER REFERENCES help_requests(id) ON DELETE CASCADE,
    volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (request_id, volunteer_id)
  )`
).then(() => console.log("Declined requests table ready"))
 .catch((err) => console.error("Error creating declined_requests table:", err));

// Volunteer-lərin "kömək edə bilərəm" TƏKLİFLƏRİ (user hələ təsdiqləməyib)
pool.query(
  `CREATE TABLE IF NOT EXISTS help_offers (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES help_requests(id) ON DELETE CASCADE,
    volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (request_id, volunteer_id)
  )`
).then(() => console.log("Help offers table ready"))
 .catch((err) => console.error("Error creating help_offers table:", err));

// ---------- APP SETUP ----------

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only images or PDF files are allowed"), ok);
  },
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ---------- AUTH ----------

app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, passwordHash, role || "user"]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo_url: user.photo_url,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ---------- PROFILE ----------

// Öz profilini gör (address/phone daxil olmaqla — yalnız özünə görünür)
app.get("/api/profile/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, age, gender, phone, address, bio, photo_url,
              rating_avg, rating_count, emergency_contact_name, emergency_contact_phone
       FROM users WHERE id = $1`,
      [req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching profile" });
  }
});

// Öz profilini yenilə
app.put("/api/profile/me", authenticate, async (req, res) => {
  const { age, gender, phone, address, bio, emergency_contact_name, emergency_contact_phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
         age = COALESCE($1, age),
         gender = COALESCE($2, gender),
         phone = COALESCE($3, phone),
         address = COALESCE($4, address),
         bio = COALESCE($5, bio),
         emergency_contact_name = COALESCE($6, emergency_contact_name),
         emergency_contact_phone = COALESCE($7, emergency_contact_phone)
       WHERE id = $8
       RETURNING id, name, email, role, age, gender, phone, address, bio, photo_url, rating_avg, rating_count, emergency_contact_name, emergency_contact_phone`,
      [age, gender, phone, address, bio, emergency_contact_name, emergency_contact_phone, req.userId]
    );
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while updating profile" });
  }
});

// Başqasının profilini gör (address VƏ phone HEÇ VAXT qaytarılmır)
app.get("/api/profile/:id", authenticate, async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT id, name, role, age, gender, bio, photo_url, rating_avg, rating_count
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const profile = userResult.rows[0];

    if (profile.role === "volunteer") {
      const certs = await pool.query(
        "SELECT id, title, issuer, file_url FROM volunteer_certificates WHERE user_id = $1 ORDER BY created_at DESC",
        [req.params.id]
      );
      profile.certificates = certs.rows;
    }

    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching profile" });
  }
});

// Profil şəkli yükləmək
app.post("/api/upload/photo", authenticate, upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const url = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      "UPDATE users SET photo_url = $1 WHERE id = $2 RETURNING id, photo_url",
      [url, req.userId]
    );
    res.json({ photo_url: result.rows[0].photo_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while saving photo" });
  }
});

// Sertifikat faylı yükləmək
app.post("/api/upload/certificate", authenticate, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const { title, issuer } = req.body;
  if (!title) return res.status(400).json({ error: "Certificate title is required" });
  try {
    const url = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      "INSERT INTO volunteer_certificates (user_id, title, issuer, file_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.userId, title, issuer || null, url]
    );
    res.json({ certificate: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while saving certificate" });
  }
});

app.delete("/api/certificates/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM volunteer_certificates WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Certificate not found" });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting certificate" });
  }
});

// ---------- HELP REQUESTS ----------

// Kömək tələbi yaratmaq (user rolündən)
app.post("/api/help-requests", authenticate, async (req, res) => {
  const { message } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO help_requests (requester_id, message) VALUES ($1, $2) RETURNING *",
      [req.userId, message || null]
    );
    res.json({ request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating request" });
  }
});

// Gözləyən tələblər (bu volunteer-in rədd etmədiyi VƏ artıq təklif etmədiyi)
app.get("/api/help-requests/pending", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hr.id, hr.message, hr.created_at, u.name AS requester_name
       FROM help_requests hr
       JOIN users u ON u.id = hr.requester_id
       WHERE hr.status = 'pending'
         AND NOT EXISTS (
           SELECT 1 FROM declined_requests dr
           WHERE dr.request_id = hr.id AND dr.volunteer_id = $1
         )
         AND NOT EXISTS (
           SELECT 1 FROM help_offers ho
           WHERE ho.request_id = hr.id AND ho.volunteer_id = $1
         )
       ORDER BY hr.created_at DESC`,
      [req.userId]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching requests" });
  }
});

// Volunteer "kömək edə bilərəm" TƏKLİFİ göndərir (birbaşa qəbul etmir — user seçəcək)
app.post("/api/help-requests/:id/accept", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const reqCheck = await pool.query("SELECT status FROM help_requests WHERE id = $1", [id]);
    if (reqCheck.rows.length === 0 || reqCheck.rows[0].status !== "pending") {
      return res.status(409).json({ error: "This request is no longer available" });
    }
    await pool.query(
      "INSERT INTO help_offers (request_id, volunteer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [id, req.userId]
    );
    res.json({ offered: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while offering to help" });
  }
});

// Volunteer tələbi rədd edir (yalnız bu volunteer üçün gizlədilir)
app.post("/api/help-requests/:id/decline", authenticate, async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO declined_requests (request_id, volunteer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.params.id, req.userId]
    );
    res.json({ declined: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while declining request" });
  }
});

// User öz tələblərini görsün — pending olanlarda gələn TƏKLİFLƏR (volunteer profili) daxil olmaqla
app.get("/api/help-requests/mine", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hr.*, v.name AS volunteer_name, v.age AS volunteer_age,
              v.photo_url AS volunteer_photo, v.rating_avg AS volunteer_rating,
              v.rating_count AS volunteer_rating_count,
              CASE WHEN hr.status = 'accepted' THEN v.phone ELSE NULL END AS volunteer_phone
       FROM help_requests hr
       LEFT JOIN users v ON v.id = hr.volunteer_id
       WHERE hr.requester_id = $1
       ORDER BY hr.created_at DESC`,
      [req.userId]
    );

    const requests = result.rows;

    // Pending statuslu tələblər üçün gələn təklifləri (offers) əlavə edirik
    const pendingIds = requests.filter((r) => r.status === "pending").map((r) => r.id);
    let offersByRequest = {};
    if (pendingIds.length > 0) {
      const offersResult = await pool.query(
        `SELECT ho.request_id, ho.volunteer_id, u.name, u.age, u.photo_url,
                u.rating_avg, u.rating_count
         FROM help_offers ho
         JOIN users u ON u.id = ho.volunteer_id
         WHERE ho.request_id = ANY($1::int[])
         ORDER BY ho.created_at ASC`,
        [pendingIds]
      );
      offersByRequest = offersResult.rows.reduce((acc, o) => {
        acc[o.request_id] = acc[o.request_id] || [];
        acc[o.request_id].push(o);
        return acc;
      }, {});
    }

    const enriched = requests.map((r) => ({ ...r, offers: offersByRequest[r.id] || [] }));

    res.json({ requests: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching your requests" });
  }
});

// User gələn təkliflərdən birini SEÇİR/təsdiqləyir
app.post("/api/help-requests/:id/confirm", authenticate, async (req, res) => {
  const { volunteerId } = req.body;
  if (!volunteerId) return res.status(400).json({ error: "volunteerId is required" });
  try {
    const result = await pool.query(
      `UPDATE help_requests SET volunteer_id = $1, status = 'accepted'
       WHERE id = $2 AND requester_id = $3 AND status = 'pending'
       RETURNING *`,
      [volunteerId, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Could not confirm this volunteer" });
    }
    await pool.query("DELETE FROM help_offers WHERE request_id = $1", [req.params.id]);
    res.json({ request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while confirming volunteer" });
  }
});

// Volunteer-in qəbul olunmuş (accepted) tələbləri — requester profili ilə birlikdə
app.get("/api/help-requests/accepted-by-me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hr.*, u.name AS requester_name, u.age AS requester_age,
              u.photo_url AS requester_photo, u.rating_avg AS requester_rating,
              u.rating_count AS requester_rating_count, u.phone AS requester_phone
       FROM help_requests hr
       JOIN users u ON u.id = hr.requester_id
       WHERE hr.volunteer_id = $1 AND hr.status = 'accepted'
       ORDER BY hr.created_at DESC`,
      [req.userId]
    );
    res.json({ requests: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching accepted requests" });
  }
});

// Kömək bitdikdən sonra qarşı tərəfi qiymətləndirmək
app.post("/api/help-requests/:id/rate", authenticate, async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }
  try {
    const reqResult = await pool.query("SELECT * FROM help_requests WHERE id = $1", [req.params.id]);
    if (reqResult.rows.length === 0) return res.status(404).json({ error: "Request not found" });

    const helpRequest = reqResult.rows[0];
    let targetUserId;

    if (req.userId === helpRequest.requester_id) {
      targetUserId = helpRequest.volunteer_id;
    } else if (req.userId === helpRequest.volunteer_id) {
      targetUserId = helpRequest.requester_id;
    } else {
      return res.status(403).json({ error: "You are not part of this request" });
    }

    if (!targetUserId) return res.status(400).json({ error: "No one to rate yet" });

    const updated = await pool.query(
      `UPDATE users SET
         rating_avg = ((rating_avg * rating_count) + $1) / (rating_count + 1),
         rating_count = rating_count + 1
       WHERE id = $2
       RETURNING rating_avg, rating_count`,
      [rating, targetUserId]
    );

    res.json({ rated: true, newRating: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while rating" });
  }
});

// ---------- EXISTING FEATURES ----------

app.get("/api/route", async (req, res) => {
  const { startLat, startLon, endLat, endLon } = req.query;

  if (!startLat || !startLon || !endLat || !endLon) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {
    const url = `https://api.openrouteservice.org/v2/directions/wheelchair?api_key=${process.env.ORS_API_KEY}&start=${startLon},${startLat}&end=${endLon},${endLat}`;
    const orsRes = await fetch(url);
    const data = await orsRes.json();

    if (!data.features || data.features.length === 0) {
      return res.status(404).json({ error: "No accessible route found" });
    }

    const coords = data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);
    const segment = data.features[0].properties.segments[0];

    res.json({
      coordinates: coords,
      distanceKm: (segment.distance / 1000).toFixed(2),
      durationMin: Math.round(segment.duration / 60),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching route" });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a helpful travel assistant for elderly and disabled travelers, focused on accessibility (wheelchair access, step-free routes, accessible facilities). Answer briefly and clearly. User question: ${message}`,
              },
            ],
          },
        ],
      }),
    });
    const data = await geminiRes.json();

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      console.error("Gemini response:", JSON.stringify(data));
      return res.status(500).json({ error: "No reply from AI" });
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while contacting AI" });
  }
});

app.get("/api/places", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {
    const url = `https://api.geoapify.com/v2/places?categories=accommodation.hotel,catering.restaurant&filter=circle:${lon},${lat},1500&limit=20&apiKey=${process.env.GEOAPIFY_API_KEY}`;
    const geoRes = await fetch(url);
    const data = await geoRes.json();

    const places = (data.features || [])
      .filter((f) => f.properties && f.properties.name)
      .map((f) => {
        const raw = f.properties.datasource?.raw || {};
        const categories = f.properties.categories || [];
        return {
          id: f.properties.place_id,
          name: f.properties.name,
          type: categories.includes("catering.restaurant") ? "Restaurant" : "Hotel",
          wheelchair: raw.wheelchair || "unknown",
          lat: f.properties.lat,
          lon: f.properties.lon,
        };
      });

    res.json({ places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching places" });
  }
});

app.get("/", (req, res) => {
  res.send("Wayfare backend is running");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
