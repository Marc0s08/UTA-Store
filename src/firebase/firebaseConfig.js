import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDn6C6LnT6Z5FVQZSCsg6Kl_-_fdzUMTFI",
    authDomain: "barons-cave.firebaseapp.com",
    projectId: "barons-cave",
    storageBucket: "barons-cave.appspot.com",
    messagingSenderId: "453502993981",
    appId: "1:453502993981:web:217758ba871e9e28854c54",
    measurementId: "G-D5P6MQ3PWE"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;