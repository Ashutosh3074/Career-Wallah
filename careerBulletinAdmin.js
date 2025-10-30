// careerBulletinAdmin.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadBulletins() {
  const q = query(collection(db, "careerBulletin"), orderBy("postedAt", "desc"));
  const snapshot = await getDocs(q);
  bulletinList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const article = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.className = "bulletin-card";
    card.innerHTML = `
      <h3 style="color:#009e60">${article.name}</h3>
      <p><strong>Author:</strong> ${article.author}</p>
      <button style="background:#009e60;color:#fff;" onclick="viewBulletin('${id}')">👁️ View</button>
      <button style="background:#00694d;color:#fff;" onclick="editBulletin('${id}')">✏️ Edit</button>
      <button style="background:#cc0000;color:#fff;" onclick="deleteBulletin('${id}')">❌ Delete</button>
    `;
    bulletinList.appendChild(card);
    window[`bulletin_${id}`] = article;
  });
}




// ⏳ Wait for DOM to load before attaching events
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const adminSection = document.getElementById("admin-section");
  const bulletinForm = document.getElementById("bulletin-form");
  const bulletinList = document.getElementById("bulletin-list");

  // 🔐 Auth Logic
  loginBtn?.addEventListener("click", () => signInWithPopup(auth, provider));
  logoutBtn?.addEventListener("click", () => signOut(auth));

  onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    adminSection.style.display = "block";
    loadBulletins();
  } else {
    signOut(auth); // Force logout if not admin
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    adminSection.style.display = "none";
  }
});


  // ➕ Add Article
  bulletinForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("articleName").value.trim();
  const publishDate = document.getElementById("publishDate").value;
  const author = document.getElementById("authorName").value.trim();
  const authorDetails = document.getElementById("authorDetails").value.trim();
  const imageUrl = document.getElementById("articleImage").value.trim();
  const content = document.getElementById("articleContent").value.trim();

  if (!name || !publishDate || !author || !content) {
    alert("Please fill all required fields.");
    return;
  }

  const newArticle = {
    name,
    publishDate,
    author,
    authorDetails,
    imageUrl,
    content,
    postedAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, "careerBulletin"), newArticle);
    alert("Article posted successfully!");
    bulletinForm.reset();
    loadBulletins();
  } catch (error) {
    alert("❌ Error adding article: " + error.message);
  }
});


  // 📃 Load Articles
  async function loadBulletins() {
    const snapshot = await getDocs(collection(db, "careerBulletin"));
    bulletinList.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const article = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "bulletin-card";
      card.innerHTML = `
        <h3 style="color:#009e60">${article.name}</h3>
        <p><strong>Author:</strong> ${article.author}</p>
        <button style="background:#009e60;color:#fff;" onclick="viewBulletin('${id}')">👁️ View</button>
        <button style="background:#00694d;color:#fff;" onclick="editBulletin('${id}')">✏️ Edit</button>
        <button style="background:#cc0000;color:#fff;" onclick="deleteBulletin('${id}')">❌ Delete</button>
      `;
      bulletinList.appendChild(card);
      window[`bulletin_${id}`] = article;
    });
  }

  // 🔍 View Article
  window.viewBulletin = (id) => {
    const a = window[`bulletin_${id}`];
    alert(
      `📰 ${a.name}\n\n📅 ${a.publishDate}\n👨‍💼 ${a.author}\n\n📜 ${a.content}\n\n🖊️ ${a.authorDetails}\n🖼️ ${a.imageUrl}`
    );
  };

  // ✏️ Edit Article
  window.editBulletin = async (id) => {
    const old = window[`bulletin_${id}`];
    const updated = {};

    for (const key in old) {
      if (key !== "postedAt") {
        const newVal = prompt(`Edit ${key}`, old[key]);
        if (newVal !== null) updated[key] = newVal;
      }
    }

    await updateDoc(doc(db, "careerBulletin", id), updated);
    loadBulletins();
  };

  // ❌ Delete Article
  window.deleteBulletin = async (id) => {
    if (confirm("Are you sure you want to delete this article?")) {
      await deleteDoc(doc(db, "careerBulletin", id));
      loadBulletins();
    }
  };
});

