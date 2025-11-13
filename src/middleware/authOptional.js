import admin from "firebase-admin";

let inited = false;

function init() {
  if (inited) return;
  if (!process.env.FIREBASE_CLIENT_EMAIL) return; 
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
  inited = true;
}

export async function authOptional(req, _res, next) {
  try {
    init();
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (token && inited) {
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = decoded; 
    }
  } catch {
    
  } finally {
    next();
  }
}
