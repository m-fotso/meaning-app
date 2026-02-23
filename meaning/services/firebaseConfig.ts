// services/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArdkOMzlyyte58X1bbGrKYYKho1Kjw7R4",
  authDomain: "meaning-app-6a4c1.firebaseapp.com",
  projectId: "meaning-app-6a4c1",
  storageBucket: "meaning-app-6a4c1.firebasestorage.app",
  messagingSenderId: "29895253610",
  appId: "1:29895253610:web:33edeb6b03ea6266037413"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;