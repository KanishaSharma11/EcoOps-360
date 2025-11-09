const admin = require("firebase-admin");

async function getFetch() {
  const mod = await import("node-fetch");
  return mod.default;
}

// ✅ Region mapping
const regions = {
  "US-Central1": "US-MIDW-MISO",
  "Europe-West1": "DE",
  "Asia-South1": "IN-WE",
  "Australia-SE1": "AU-NSW",
  "NorthAmerica-Northeast1": "CA-QC",
  "SouthAmerica-East1": "BR-CS",
  "Africa-South1": "ZA",
  "Me-Central2": "SA",
  "Asia-Northeast2": "JP-KN",
};

async function updateCarbonData() {
  console.log("🪴 [1] updateCarbonData() started");

  const ElectricityAPIKey = process.env.ElectricityAPIKey;
  const firebaseCreds = process.env.FIREBASE_SERVICE_ACCOUNT;

  console.log("🪴 [2] Checking environment vars");
  console.log("ElectricityAPIKey exists:", !!ElectricityAPIKey);
  console.log("Firebase creds exist:", !!firebaseCreds);

  if (!ElectricityAPIKey) throw new Error("Missing ElectricityAPIKey");
  if (!firebaseCreds) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");

  console.log("🪴 [3] Parsing Firebase creds");
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(firebaseCreds);
  } catch (e) {
    console.error("❌ Failed to parse Firebase creds:", e.message);
    throw e;
  }

  console.log("🪴 [4] Initializing Firebase");
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("🔥 Firebase initialized");
  }

  const db = admin.firestore();

  console.log("🪴 [5] Importing fetch");
  const fetch = await getFetch();
  console.log("🪴 [6] Fetch ready");

  // Timeout helper
  const fetchWithTimeout = (url, options, timeoutMs = 10000) =>
    Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fetch timeout")), timeoutMs)
      ),
    ]);

  for (const [region, code] of Object.entries(regions)) {
    try {
      console.log(`🪴 [7] Fetching ${region} (${code})`);
      const res = await fetchWithTimeout(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        { headers: { "auth-token": ElectricityAPIKey } }
      );
      console.log(`[8] ${region} status:`, res.status);

      if (!res.ok) continue;
      const data = await res.json();
      console.log(`[9] ${region} data:`, data);

      const intensity = data.carbonIntensity || 0;
      const level = intensity >= 350 ? "High" : intensity > 170 ? "Medium" : "Low";

      await db.collection("carbon-regions").doc(region).set({
        name: region,
        intensityValue: intensity,
        intensityLevel: level,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ [10] Updated ${region}: ${intensity} (${level})`);
    } catch (err) {
      console.error(`⚠️ [ERR] ${region}:`, err.message);
    }
  }

  console.log("🏁 [11] Finished all regions");
}

module.exports = updateCarbonData;
