
// api/updateCarbonData.js
const admin = require("firebase-admin");

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

async function safeInitFirebase() {
  if (admin.apps.length) return;
  console.log("🔥 Initializing Firebase...");
  const creds = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!creds) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  const json = JSON.parse(creds);
  admin.initializeApp({ credential: admin.credential.cert(json) });
  console.log("🔥 Firebase initialized!");
}

async function updateCarbonData() {
  console.log("⚙️ Starting updateCarbonData...");
  const key = process.env.ElectricityAPIKey;
  if (!key) throw new Error("Missing ElectricityAPIKey");

  await Promise.race([
    safeInitFirebase(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firebase init timeout")), 10000)
    ),
  ]);

  const db = admin.firestore();

  for (const [region, code] of Object.entries(regions)) {
    try {
      console.log(`🌍 Fetching data for ${region} (${code})`);
      const res = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        { headers: { "auth-token": key } }
      );

      console.log(`${region} → status ${res.status}`);
      if (!res.ok) continue;
      const data = await res.json();
      const intensity = data.carbonIntensity || 0;
      const level = intensity >= 350 ? "High" : intensity > 170 ? "Medium" : "Low";

      await db.collection("carbon-regions").doc(region).set({
        name: region,
        intensityValue: intensity,
        intensityLevel: level,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ ${region}: ${intensity} (${level})`);
    } catch (err) {
      console.error(`⚠️ ${region} failed:`, err.message);
    }
  }
  console.log("🏁 All regions processed");
}

module.exports = updateCarbonData;
