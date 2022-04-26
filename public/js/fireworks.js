import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKNuQhNDM9MmMalMQWU1E3uDSI4F-9XiI",
  authDomain: "rebalance-a57a1.firebaseapp.com",
  projectId: "rebalance-a57a1",
  storageBucket: "rebalance-a57a1.appspot.com",
  messagingSenderId: "317724135093",
  appId: "1:317724135093:web:530bea880b3fb555cd78fc",
  measurementId: "G-3EY13ERFN6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get a list of cities from your database
async function getCities() {
  const citiesCol = collection(db, "fcmKey");
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map((doc) => {
    return { id: doc.id, data: doc.data() };
  });
  return cityList;
}
let hja = await getCities();

// let res = await setDoc(doc(db, "cities", "LA"), {
//   name: "Los Angeles",
//   state: "CA",
//   country: "USA",
// });

console.log(hja);
