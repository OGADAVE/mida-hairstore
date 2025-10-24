// -------------------- Firebase Imports --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// -------------------- Firebase Config --------------------
const firebaseConfig = {
  apiKey: "AIzaSyCOeH-lUEkvO68Tfob__RMa1jROfucKRHA",
  authDomain: "mida-hairstore.firebaseapp.com",
  projectId: "mida-hairstore",
  storageBucket: "mida-hairstore.appspot.com",
  messagingSenderId: "597531926831",
  appId: "1:597531926831:web:70260221221be48b7d01da",
  measurementId: "G-9XD6BZTMLG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------------- LOGIN PAGE --------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("loginError");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "admin-dashboard.html";
    } catch (error) {
      errorEl.textContent = "Invalid login credentials.";
      console.error(error);
    }
  });
}

// -------------------- DASHBOARD PROTECTION --------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "admin-login.html";
  });
}

onAuthStateChanged(auth, (user) => {
  if (window.location.pathname.includes("admin-dashboard.html") && !user) {
    window.location.href = "admin-login.html";
  }
});

// -------------------- CLOUDINARY UPLOAD FUNCTION --------------------
async function uploadToCloudinary(file) {
  const cloudName = "dnjwoniyl";
  const uploadPreset = "mida_hairstore";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

// -------------------- ADD PRODUCT --------------------
const addProductForm = document.getElementById("addProductForm");
if (addProductForm) {
  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const desc = document.getElementById("productDesc").value.trim();
    const link = document.getElementById("productLink").value.trim();
    const file = document.getElementById("productImage").files[0];
    const msg = document.getElementById("formMessage");

    if (!file) return (msg.textContent = "Please select an image.");

    try {
      msg.textContent = "Uploading image...";
      const imageURL = await uploadToCloudinary(file);

      msg.textContent = "Saving product...";
      await addDoc(collection(db, "products"), {
        name,
        price,
        description: desc,
        orderLink: link,
        imageURL,
        createdAt: new Date(),
      });

      msg.textContent = "✅ Product added successfully!";
      addProductForm.reset();
      loadProducts();
    } catch (error) {
      msg.textContent = "❌ " + error.message;
      console.error(error);
    }
  });
}

// -------------------- LOAD PRODUCTS --------------------
const productGrid = document.getElementById("productGrid");
const waNumber = "2347025849100"; // WhatsApp number

async function loadProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = "<p>Loading products...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    productGrid.innerHTML = "";

    if (querySnapshot.empty) {
      productGrid.innerHTML = "<p>No products yet.</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const productId = docSnap.id;

      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <img src="${data.imageURL}" alt="${data.name}">
        <h3>${data.name}</h3>
        <p>${data.description}</p>
        <p class="product-price">₦${data.price}</p>
        <a href="https://wa.me/${waNumber}?text=Hi%20MIDA%20HAIRSTORE!%20I'm%20interested%20in%20${encodeURIComponent(
        data.name
      )}" target="_blank" class="order-btn">Order Now</a>
        <button class="delete-btn" onclick="deleteProduct('${productId}')">Delete</button>
      `;
      productGrid.appendChild(card);
    });
  } catch (error) {
    productGrid.innerHTML = `<p>Error loading products: ${error.message}</p>`;
  }
}

window.addEventListener("DOMContentLoaded", loadProducts);

// -------------------- DELETE PRODUCT --------------------
window.deleteProduct = async (id) => {
  if (!confirm("Are you sure you want to delete this product?")) return;
  try {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  } catch (error) {
    alert("Error deleting product: " + error.message);
  }
};
