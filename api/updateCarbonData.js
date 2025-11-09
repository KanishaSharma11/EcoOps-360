// ---- Setup ----
import fetch from "node-fetch";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

// Parse the JSON string from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };


// ---- Initialize Firebase ----
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// ---- Define Regions Mapping ----
const regions = {
  "US-Central1": "US-MIDW-MISO",   // Midcontinent ISO (covers U.S. central states)
  "Europe-West1": "DE",            // Germany
  "Asia-South1": "IN-WE",          // Western India (most representative for Asia-South1)
  "Australia-SE1": "AU-NSW",        // New South Wales, Australia (Southeast region)
  "NorthAmerica-Northeast1": "CA-QC",  // Canada (Quebec)
  "SouthAmerica-East1": "BR-CS",       // Brazil (Central-Southeast)
  "Africa-South1": "ZA",               // South Africa
  "Me-Central2": "SA",                 // Saudi Arabia
  "Asia-Northeast2": "JP-KN"  

};


// ---- Fetch & Update ----
async function updateCarbonData() {
  for (const [region, code] of Object.entries(regions)) {
    try {
      const response = await fetch(
        `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${code}`,
        { headers: { "auth-token": ElectricityAPIKey } }
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
        updatedAt: new Date().toISOString()
      });

      console.log(`✅ Updated ${region}: ${intensityValue} gCO₂/kWh (${intensityLevel})`);
    } catch (error) {
      console.error(`⚠️ Error updating ${region}:`, error);
    }
  }
}

// ---- Run function ----
updateCarbonData();
export default updateCarbonData;
