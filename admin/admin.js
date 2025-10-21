// -------------------- Firebase Imports --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// -------------------- Firebase Config --------------------
const firebaseConfig = {
  apiKey: "AIzaSyCOeH-lUEkvO68Tfob__RMa1jROfucKRHA",
  authDomain: "mida-hairstore.firebaseapp.com",
  projectId: "mida-hairstore",
  storageBucket: "mida-hairstore.appspot.com",
  messagingSenderId: "597531926831",
  appId: "1:597531926831:web:70260221221be48b7d01da",
  measurementId: "G-9XD6BZTMLG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// -------------------- LOGIN PAGE --------------------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'admin-dashboard.html';
    } catch (error) {
      errorEl.textContent = error.message;
    }
  });
}

// -------------------- DASHBOARD PAGE --------------------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => window.location.href = 'admin-login.html');
  });
}

// Protect dashboard and load products after auth
onAuthStateChanged(auth, (user) => {
  if (window.location.pathname.includes('admin-dashboard.html')) {
    if (user) {
      loadProducts();
    } else {
      window.location.href = 'admin-login.html';
    }
  }
});

// -------------------- ADD PRODUCT --------------------
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
  addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const desc = document.getElementById('productDesc').value;
    const link = document.getElementById('productLink').value;
    const file = document.getElementById('productImage').files[0];
    const msg = document.getElementById('formMessage');

    if (!file) return msg.textContent = "Please select an image";

    try {
      msg.textContent = "Uploading...";
      
      // Ensure unique filename
      const timestamp = Date.now();
      const storageRef = ref(storage, `products/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageURL = await getDownloadURL(storageRef);

      // Add product to Firestore
      await addDoc(collection(db, "products"), { name, price, description: desc, orderLink: link, imageURL });

      msg.textContent = "✅ Product added successfully!";
      addProductForm.reset();
      loadProducts(); // refresh product list
    } catch (error) {
      msg.textContent = "❌ " + error.message;
    }
  });
}

// -------------------- LOAD PRODUCTS --------------------
const productGrid = document.getElementById('productGrid');
const waNumber = "2347025849100"; // WhatsApp number

async function loadProducts() {
  if (!productGrid) return;

  // Show loading message while fetching
  productGrid.innerHTML = "<p>Loading products...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    
    // Clear placeholder
    productGrid.innerHTML = "";

    if (querySnapshot.empty) {
      productGrid.innerHTML = "<p>No products yet.</p>";
      return;
    }

    // Loop through Firebase products
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const card = document.createElement('div');
      card.classList.add('product-card');
      card.innerHTML = `
        <img src="${data.imageURL}" alt="${data.name}">
        <h3>${data.name}</h3>
        <p>${data.description}</p>
        <p class="product-price">₦${data.price}</p>
        <a href="https://wa.me/${waNumber}?text=Hi%20MIDA%20HAIRSTORE!%20I'm%20interested%20in%20${encodeURIComponent(data.name)}" 
           target="_blank" class="order-btn">Order Now</a>
      `;

      // Append AFTER existing hardcoded products
      productGrid.appendChild(card);
    });

  } catch (error) {
    productGrid.innerHTML = `<p>Error loading products: ${error.message}</p>`;
    console.error("Error loading products:", error);
  }
}

// Call on page load
window.addEventListener('DOMContentLoaded', loadProducts);

// -------------------- DELETE PRODUCT --------------------
window.deleteProduct = async (id) => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await deleteDoc(doc(db, "products", id));
      loadProducts();
    } catch (error) {
      alert("Error deleting product: " + error.message);
    }
  }
};
