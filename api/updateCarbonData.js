const fetch = require("node-fetch");
const admin = require("firebase-admin");

// ✅ Parse Firebase service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

// ✅ Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Regions mapping
const regions = {
  "US-Central1": "US-MIDW-MISO",
  "Europe-West1": "DE",
  "Asia-South1": "IN-WE",
  "Australia-SE1": "AU-NSW",
  "NorthAmerica-Northeast1": "CA-QC",
  "SouthAmerica-East1": "BR-CS",
  "Africa-South1": "ZA",
  "Me-Central2": "SA",
  "Asia-Northeast2": "JP-KN"
};

async function updateCarbonData() {
  const ElectricityAPIKey = process.env.ElectricityAPIKey;

  if (!ElectricityAPIKey) {
    throw new Error("Missing ELECTRICITYMAP_API_KEY in environment variables");
  }

  for (const [region, code] of Object.entries(regions)) {
    try {
      const response = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        { headers: { "auth-token": ElectricityAPIKey } }
      );

      if (!response.ok) {
        console.error(`❌ Failed to fetch data for ${region}: ${response.status}`);
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

      console.log(`✅ Updated ${region}: ${intensityValue} gCO₂/kWh (${intensityLevel})`);
    } catch (err) {
      console.error(`⚠️ Error updating ${region}:`, err.message);
    }
  }
}

module.exports = updateCarbonData;
