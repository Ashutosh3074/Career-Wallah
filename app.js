/** ✨ Career Wallah Admin Panel - app.js **/
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

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA_qJU-gllTt7SGjHkQe1x61Bb0IoKkMHw",
  authDomain: "career-wallah-9dae6.firebaseapp.com",
  projectId: "career-wallah-9dae6",
  storageBucket: "career-wallah-9dae6.appspot.com",
  messagingSenderId: "859534502117",
  appId: "1:859534502117:web:fa6f9640a97a9aefd38c0c",
  measurementId: "G-GCS9B6ZH0G"
};

// ✅ Firebase Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const ADMIN_EMAIL = "ashut0901@gmail.com";

// 🌐 DOM Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const adminSection = document.getElementById("admin-section");
const jobForm = document.getElementById("job-form");
const jobList = document.getElementById("job-list");
const govJobList = document.getElementById("gov-job-list");
const corpJobList = document.getElementById("corp-job-list");
const internJobList = document.getElementById("intern-job-list");
const careerBulletin = document.getElementById("bulletin-list");


// 🔐 Auth Logic
if (loginBtn) {
  loginBtn.onclick = () => signInWithPopup(auth, provider);
  logoutBtn.onclick = () => signOut(auth);

  onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
      loginBtn.style.display = "none";
      logoutBtn.style.display = "block";
      adminSection.style.display = "block";
      loadJobs();
    } else {
      adminSection.style.display = "none";
      logoutBtn.style.display = "none";
      loginBtn.style.display = "block";
    }
  });
}

// 📝 Post Full Job
if (jobForm) {
  jobForm.onsubmit = async (e) => {
    e.preventDefault();

    const jobData = {
      title: document.getElementById("jobTitle").value.trim(),
      description: document.getElementById("jobDesc").value.trim(),
      organization: document.getElementById("organization").value.trim(),
      location: document.getElementById("location").value.trim(),
      type: document.getElementById("jobType").value,
      salary: document.getElementById("salary").value.trim(),
      vacancies: document.getElementById("vacancies").value,
      eligibility: document.getElementById("eligibility").value.trim(),
      passoutYear: document.getElementById("passoutYear").value.trim(),
      ageLimit: document.getElementById("ageLimit").value.trim(),
      fee: document.getElementById("fee").value.trim(),
      lastDate: document.getElementById("lastDate").value,
      selection: document.getElementById("selection").value.trim(),
      applyLink: document.getElementById("applyLink").value.trim(),
      pdfLink: document.getElementById("pdfLink").value.trim(),
      postedAt: new Date()
    };

    await addDoc(collection(db, "jobs"), jobData);
    jobForm.reset();
    loadJobs();
  };
}

// 📥 Load & Display Jobs
async function loadJobs() {
  const querySnapshot = await getDocs(collection(db, "jobs"));

  if (jobList) jobList.innerHTML = "";
  if (govJobList) govJobList.innerHTML = "";
  if (corpJobList) corpJobList.innerHTML = "";
  if (internJobList) internJobList.innerHTML = "";
   if (careerBulletin) careerBulletin.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const job = docSnap.data();
    const id = docSnap.id;

    const jobHTML = `
      <div class="job-card">
        <h3>${job.title}</h3>
        <button onclick="viewJob('${id}')">👁️ View Details</button>
        <button onclick="editJob('${id}')">✏️ Edit</button>
        <button onclick="deleteJob('${id}')">❌ Delete</button>
      </div>
    `;

    const jobWrapper = document.createElement("div");
    jobWrapper.innerHTML = jobHTML;
    if (jobList) jobList.appendChild(jobWrapper);

    const fullJobHTML = `
      Title: ${job.title}\nOrganization: ${job.organization}\nLocation: ${job.location}\nSalary: ${job.salary}\nVacancies: ${job.vacancies}\nEligibility: ${job.eligibility}\nPassout Year: ${job.passoutYear}\nDescription: ${job.description}\nAge Limit: ${job.ageLimit}\nApplication Fee: ${job.fee}\nLast Date: ${job.lastDate}\nSelection: ${job.selection}\nApply: ${job.applyLink}\nPDF: ${job.pdfLink}
    `;
    window[`job_${id}`] = fullJobHTML;
    window[`jobData_${id}`] = job;
  });
}

// 🌐 Window Actions
window.deleteJob = async function (id) {
  await deleteDoc(doc(db, "jobs", id));
  loadJobs();
};

window.viewJob = function (id) {
  alert(window[`job_${id}`]);
};

window.editJob = async function (id) {
  const job = window[`jobData_${id}`];
  const updated = {};
  for (const key in job) {
    if (key !== "postedAt") {
      const value = prompt(`Update ${key}`, job[key]);
      if (value !== null) updated[key] = value;
    }
  }
  await updateDoc(doc(db, "jobs", id), updated);
  loadJobs();
};

// 🔄 Load on Public Page
if (!loginBtn && (govJobList || corpJobList)) loadJobs();
