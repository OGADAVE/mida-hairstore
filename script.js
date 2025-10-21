import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config (same as admin)
const firebaseConfig = {
  apiKey: "AIzaSyCOeH-lUEkvO68Tfob__RMa1jROfucKRHA",
  authDomain: "mida-hairstore.firebaseapp.com",
  projectId: "mida-hairstore",
  storageBucket: "mida-hairstore.appspot.com",
  messagingSenderId: "597531926831",
  appId: "1:597531926831:web:70260221221be48b7d01da",
  measurementId: "G-9XD6BZTMLG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load products for public display
async function loadProducts() {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  try {
    const querySnapshot = await getDocs(collection(db, "products"));

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Create new product card
      const card = document.createElement('div');
      card.classList.add('product-card');
      card.innerHTML = `
        <img src="${data.imageURL}" alt="${data.name}">
        <h3>${data.name}</h3>
        <p class="product-price">₦${data.price}</p>
        <p>${data.description}</p>
        <a href="${data.orderLink}" target="_blank" class="order-btn">Order Now</a>
      `;
      
      // Append AFTER existing hardcoded products
      productGrid.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading products: ", error);
  }
}

// Call this on page load
window.addEventListener('DOMContentLoaded', loadProducts);
