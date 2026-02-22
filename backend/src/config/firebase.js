import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const getPrivateKey = () => {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;

  let formattedKey = key.replace(/\\n/g, "\n");

  if (!formattedKey.includes("---BEGIN PRIVATE KEY---")) {
    formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}`;
  }
  if (!formattedKey.includes("---END PRIVATE KEY---")) {
    formattedKey = `${formattedKey}\n-----END PRIVATE KEY-----`;
  }

  return formattedKey;
};

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: getPrivateKey(),
};

import { mockDb, mockAuth } from "./dbMock.js";

let db = mockDb;
let auth = mockAuth;

const seedMockData = async (db) => {
  const hospitals = await db.collection("hospitals").get();
  if (hospitals.size === 0) {
    console.log("Seeding stable mock data (Hospital, Super, Admin)...");

    // Seed Hospital
    await db.collection("hospitals").doc("delhi-gov-1").set({
      name: "Delhi Government Hospital",
      type: "gov",
      address: "New Delhi, India",
      city: "Delhi",
      code: "DELGOV",
      createdAt: new Date().toISOString(),
    });

    // Seed Users
    const bcrypt = await import("bcryptjs");
    const salt = await bcrypt.default.genSalt(10);
    const superPasswordHash = await bcrypt.default.hash("super123", salt);
    const adminPasswordHash = await bcrypt.default.hash("admin123", salt);

    await db.collection("users").doc("super-user-1").set({
      name: "Global Super User",
      email: "super@meditrack.com",
      passwordHash: superPasswordHash,
      role: "super",
      hospitalId: "",
      createdAt: new Date().toISOString(),
    });

    await db.collection("users").doc("admin-user-1").set({
      name: "Delhi Hospital Admin",
      email: "admin@meditrack.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      hospitalId: "delhi-gov-1",
      createdAt: new Date().toISOString(),
    });

    console.log("Mock seeding complete.");
  }
};

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.includes("BEGIN PRIVATE KEY")) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
      console.log("Firebase Admin Initialized Successfully");
      db = admin.firestore();
      auth = admin.auth();
    } else {
      db = mockDb;
      auth = mockAuth;
      console.warn("Running in MOCK MODE.");
      seedMockData(db);
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
    db = mockDb;
    auth = mockAuth;
    console.warn("Falling back to MOCK MODE.");
    seedMockData(db);
  }
}

export { db, auth, admin };
