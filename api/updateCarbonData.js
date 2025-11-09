// ✅ api/updateCarbonData.js — fixed for node-fetch ESM issue
const admin = require("firebase-admin");

async function fetchJSON(url, options) {
  const fetch = (await import("node-fetch")).default;
  return fetch(url, options);
}

console.log("🪶 updateCarbonData.js loaded");

let serviceAccount = null;

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT is missing!");
  } else {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("✅ Parsed FIREBASE_SERVICE_ACCOUNT");
  }
} catch (e) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e.message);
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("✅ Firebase initialized");
  } catch (err) {
    console.error("❌ Firebase init failed:", err.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

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
  console.log("🚦 Entered updateCarbonData()");

  const ElectricityAPIKey = process.env.ElectricityAPIKey;
  if (!ElectricityAPIKey) throw new Error("Missing ELECTRICITYMAP_API_KEY in environment");
  if (!db) throw new Error("Firestore DB not initialized");

  for (const [region, code] of Object.entries(regions)) {
    console.log(`🌍 Fetching data for ${region} (${code})...`);
    try {
      const response = await fetchJSON(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        { headers: { "auth-token": ElectricityAPIKey } }
      );

      if (!response.ok) {
        console.error(`❌ Failed ${region}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const intensityValue = data.carbonIntensity || 0;
      let intensityLevel = "Low";
      if (intensityValue > 170) intensityLevel = "Medium";
      if (intensityValue >= 350) intensityLevel = "High";

      await db.collection("carbon-regions").doc(region).set({
        name: region,
        intensityValue,
        intensityLevel,
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Stored ${region}: ${intensityValue} gCO₂/kWh (${intensityLevel})`);
    } catch (err) {
      console.error(`⚠️ Error processing ${region}:`, err.message);
    }
  }

  console.log("🏁 Finished all regions");
}

module.exports = updateCarbonData;
