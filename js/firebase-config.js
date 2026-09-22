const firebaseConfig = {
  apiKey: "AIzaSyDYDOGVq-edpZd3JT-1cR8NhOyJcr9MtiU",
  authDomain: "sureka-deshan-wedding.firebaseapp.com",
  projectId: "sureka-deshan-wedding",
  storageBucket: "sureka-deshan-wedding.firebasestorage.app",
  messagingSenderId: "685977493110",
  appId: "1:685977493110:web:5531d95a9e7c608e2cc957"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();