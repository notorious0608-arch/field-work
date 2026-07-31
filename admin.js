import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, doc, getDoc, setDoc, 
  collection, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  const targetContent = document.getElementById(`content-${tabId}`);
  const targetTab = document.getElementById(`tab-${tabId}`);
  
  if (targetContent) targetContent.classList.remove('hidden');
  if (targetTab) targetTab.classList.add('active');
};

window.createJob = async function(e) {
  e.preventDefault();
  const title = document.getElementById('jobTitle').value;
  const location = document.getElementById('jobLocation').value;
  const date = document.getElementById('jobDate').value;
  const wage = document.getElementById('jobWage').value;
  const capacity = document.getElementById('jobCapacity').value;

  try {
    const newDocRef = doc(collection(db, "jobs"));
    await setDoc(newDocRef, {
      title: title,
      location: location,
      date: date,
      wage: Number(wage),
      capacity: Number(capacity),
      assignedCount: 0,
      createdAt: new Date().toISOString()
    });
    alert("案件を作成・公開しました！");
    e.target.reset();
  } catch (err) {
    console.error("案件作成エラー:", err);
  }
};

// 初期データ読み込み
document.addEventListener('DOMContentLoaded', () => {
  // スタッフ一覧取得
  onSnapshot(collection(db, "staffs"), (snapshot) => {
    const staffListEl = document.getElementById('staffList');
    if (!staffListEl) return;
    
    let html = `<table class="w-full text-xs text-left">
      <thead class="bg-slate-100 border-b">
        <tr>
          <th class="p-2">氏名</th>
          <th class="p-2">電話番号</th>
          <th class="p-2">口座情報</th>
        </tr>
      </thead><tbody>`;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const bank = data.bank || {};
      html += `<tr class="border-b">
        <td class="p-2 font-bold">${data.name || docSnap.id}</td>
        <td class="p-2">${data.phone || '-'}</td>
        <td class="p-2">${bank.bankName || ''} ${bank.branchName || ''} ${bank.accountNum || ''}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    staffListEl.innerHTML = html;
  });
});