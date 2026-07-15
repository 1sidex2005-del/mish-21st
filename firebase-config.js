/* =========================================================
   Paste YOUR firebaseConfig object below, replacing the
   placeholder values. You get this from:
   Firebase Console → Project Settings → General → Your apps → SDK setup
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBPdb_bb_nrK96BDqEbFOySsJOfCDzWJOw",
  authDomain: "mish-21st.firebaseapp.com",
  projectId: "mish-21st",
  storageBucket: "mish-21st.firebasestorage.app",
  messagingSenderId: "691439668625",
  appId: "1:691439668625:web:cec14411886d64c7065e30",
};

// Do not edit below this line
const stillPlaceholder = Object.values(firebaseConfig).some((v) => v.startsWith("PASTE_YOUR"));
if (!stillPlaceholder) {
  firebase.initializeApp(firebaseConfig);
  window.mishDB = firebase.firestore();
}
// If it's still placeholder values, window.mishDB stays undefined and the
// wish wall automatically falls back to local-only mode — no errors shown.
