const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
origin: process.env.FRONTEND_URL
? process.env.FRONTEND_URL.split(",").map(url => url.trim())
: false
}));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

const supabase = supabaseUrl && supabaseKey
? createClient(supabaseUrl, supabaseKey)
: null;

function requireSupabase(req, res, next) {
if (!supabase) {
return res.status(503).json({
error: "Backend configuration is incomplete."
});
}
next();
}

async function requireUser(req, res, next) {
try {
const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

if (!token) {
  return res.status(401).json({ error: "Please sign in first." });
}

const { data, error } = await supabase.auth.getUser(token);

if (error || !data.user) {
  return res.status(401).json({ error: "Invalid or expired login." });
}

req.user = data.user;
req.userSupabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: { Authorization: `Bearer ${token}` }
  }
});

next();

} catch {
res.status(500).json({ error: "Authentication failed." });
}
}

app.get("/", (req, res) => {
res.json({
name: "WorldTrip API",
status: "running"
});
});

app.get("/api/destinations", requireSupabase, async (req, res) => {
try {
const search = String(req.query.search || "").trim();
let query = supabase
.from("destinations")
.select("id,name,country,category,description,estimated_daily_cost")
.order("name")
.limit(100);

if (search) {
  const safeSearch = search.replace(/[,%()]/g, "");
  query = query.or(
    `name.ilike.%${safeSearch}%,country.ilike.%${safeSearch}%`
  );
}

const { data, error } = await query;

if (error) throw error;
res.json({ destinations: data });

} catch {
res.status(500).json({ error: "Could not load destinations." });
}
});

app.post("/api/trips/estimate", (req, res) => {
const days = Number(req.body.days);
const travelers = Number(req.body.travelers);
const dailyCost = Number(req.body.dailyCost ?? 2500);
const transportCost = Number(req.body.transportCost ?? 0);

if (
!Number.isInteger(days) || days < 1 || days > 365 ||
!Number.isInteger(travelers) || travelers < 1 || travelers > 50 ||
!Number.isFinite(dailyCost) || dailyCost < 0 ||
!Number.isFinite(transportCost) || transportCost < 0
) {
return res.status(400).json({ error: "Please check your trip details." });
}

const accommodationFoodActivities = days * travelers * dailyCost;
const total = accommodationFoodActivities + transportCost;

res.json({
currency: "INR",
days,
travelers,
accommodationFoodActivities,
transportCost,
estimatedTotal: total,
note: "Illustrative estimate only; actual prices may differ."
});
});

app.post("/api/trips", requireSupabase, requireUser, async (req, res) => {
const { destination, start_date, end_date, estimated_cost } = req.body;
const cost = Number(estimated_cost);

if (
typeof destination !== "string" || !destination.trim() ||
!start_date || !end_date ||
!Number.isFinite(Date.parse(start_date)) ||
!Number.isFinite(Date.parse(end_date)) ||
end_date <= start_date ||
!Number.isFinite(cost) || cost < 0
) {
return res.status(400).json({ error: "Invalid trip details." });
}

try {
const { data, error } = await req.userSupabase
.from("saved_trips")
.insert({
user_id: req.user.id,
destination: destination.trim(),
start_date,
end_date,
estimated_cost: cost
})
.select()
.single();

if (error) throw error;
res.status(201).json({ trip: data });

} catch {
res.status(500).json({ error: "Could not save this trip." });
}
});

app.get("/api/trips", requireSupabase, requireUser, async (req, res) => {
try {
const { data, error } = await req.userSupabase
.from("saved_trips")
.select("*")
.order("created_at", { ascending: false });

if (error) throw error;
res.json({ trips: data });

} catch {
res.status(500).json({ error: "Could not load saved trips." });
}
});

app.delete("/api/trips/:id", requireSupabase, requireUser, async (req, res) => {
const id = Number(req.params.id);

if (!Number.isSafeInteger(id) || id < 1) {
return res.status(400).json({ error: "Invalid trip ID." });
}

try {
const { data, error } = await req.userSupabase
.from("saved_trips")
.delete()
.eq("id", id)
.select("id");

if (error) throw error;

if (!data.length) {
  return res.status(404).json({ error: "Trip not found." });
}

res.json({ message: "Trip deleted successfully." });

} catch {
res.status(500).json({ error: "Could not delete this trip." });
}
});

app.listen(PORT, () => {
console.log("WorldTrip API running on port ${PORT}");
});
