// ✅ updateCarbonData.js — CommonJS version (for Vercel-compatible Express backend)

const fetch = require("node-fetch");
const admin = require("firebase-admin");

// ✅ Parse the JSON string from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// ✅ Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Define Region Mappings
const regions = {
  "US-Central1": "US-MIDW-MISO",      // Midcontinent ISO (U.S. central)
  "Europe-West1": "DE",               // Germany
  "Asia-South1": "IN-WE",             // Western India
  "Australia-SE1": "AU-NSW",          // New South Wales, Australia
  "NorthAmerica-Northeast1": "CA-QC", // Quebec, Canada
  "SouthAmerica-East1": "BR-CS",      // Brazil
  "Africa-South1": "ZA",              // South Africa
  "Me-Central2": "SA",                // Saudi Arabia
  "Asia-Northeast2": "JP-KN"          // Japan
};

// ✅ Fetch & Update Carbon Data
async function updateCarbonData() {

  for (const [region, code] of Object.entries(regions)) {
    try {
      const response = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        {
          headers: { "auth-token": "50nZmfUw4EItQ1F9HUzP" },
        }
      );

      if (!response.ok) {
        console.error(`❌ Failed to fetch data for ${region}`);
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
    } catch (error) {
      console.error(`⚠ Error updating ${region}:, error`);
    }
  }
}

module.exports = updateCarbonData;
