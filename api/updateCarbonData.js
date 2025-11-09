const admin = require("firebase-admin");

// ✅ Lazy-load node-fetch once, globally
let fetchFn = null;
async function getFetch() {
  if (!fetchFn) {
    const mod = await import("node-fetch");
    fetchFn = mod.default;
  }
  return fetchFn;
}

// ✅ Parse Firebase credentials
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

// ✅ Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  console.log("🔥 Initializing Firebase Admin...");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase initialized!");
}

const db = admin.firestore();

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

// ✅ Main update function
async function updateCarbonData() {
  console.log("⚙️ Starting updateCarbonData...");

  const ElectricityAPIKey = process.env.ElectricityAPIKey;
  if (!ElectricityAPIKey) throw new Error("Missing ElectricityAPIKey");
  if (!process.env.FIREBASE_SERVICE_ACCOUNT)
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");

  const fetch = await getFetch();

  for (const [region, code] of Object.entries(regions)) {
    try {
      console.log(`🌍 Fetching data for ${region} (${code})`);

      const response = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        { headers: { "auth-token": ElectricityAPIKey } }
      );

      console.log(`${region} → Response status: ${response.status}`);

      if (!response.ok) {
        console.error(`❌ Failed for ${region} (${response.status})`);
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

      console.log(`✅ ${region}: ${intensityValue} gCO₂/kWh (${intensityLevel})`);
    } catch (error) {
      console.error(`⚠️ Error updating ${region}:`, error.message);
    }
  }

  console.log("🏁 Finished all regions update");
}

module.exports = updateCarbonData;
