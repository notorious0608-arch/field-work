import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, 
  collection, query, where, getDocs, onSnapshot 
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

let currentStaffName = localStorage.getItem("staffName") || "山田 太郎";

// グローバル関数（HTML内のonclick属性などから呼べるようにwindowにバインド）
window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  const targetContent = document.getElementById(`content-${tabId}`);
  const targetTab = document.getElementById(`tab-${tabId}`);
  
  if (targetContent) targetContent.classList.remove('hidden');
  if (targetTab) targetTab.classList.add('active');
};

window.updateStaffName = function() {
  const input = document.getElementById('staffNameInput');
  if (input && input.value) {
    currentStaffName = input.value;
    localStorage.setItem("staffName", currentStaffName);
    document.getElementById('staffNameDisplay').textContent = currentStaffName;
  }
};

window.openAdminAuthModal = function() {
  document.getElementById('adminAuthModal').classList.remove('hidden');
  document.getElementById('adminAuthModal').classList.add('flex');
};

window.closeAdminModal = function() {
  document.getElementById('adminAuthModal').classList.add('hidden');
  document.getElementById('adminAuthModal').classList.remove('flex');
};

window.saveNotice = async function() {
  const val = document.getElementById('noticeInput').value;
  try {
    await setDoc(doc(db, "settings", "notice"), { text: val });
    closeAdminModal();
  } catch (err) {
    console.error("お知らせ保存エラー:", err);
  }
};

window.submitShift = async function(e) {
  e.preventDefault();
  const date = document.getElementById('shiftDate').value;
  const start = document.getElementById('shiftStart').value;
  const end = document.getElementById('shiftEnd').value;
  const memo = document.getElementById('shiftMemo').value;

  try {
    await setDoc(doc(db, "shifts", `${currentStaffName}_${date}`), {
      staffName: currentStaffName,
      date: date,
      startTime: start,
      endTime: end,
      memo: memo,
      status: "pending"
    });
    alert("希望シフトを提出しました！");
  } catch (err) {
    console.error("シフト提出エラー:", err);
  }
};

window.saveProfile = async function(e) {
  e.preventDefault();
  const phone = document.getElementById('profPhone').value;
  const bank = document.getElementById('bankName').value;
  const branch = document.getElementById('branchName').value;
  const type = document.getElementById('accountType').value;
  const num = document.getElementById('accountNum').value;

  try {
    await setDoc(doc(db, "staffs", currentStaffName), {
      name: currentStaffName,
      phone: phone,
      bank: { bankName: bank, branchName: branch, accountType: type, accountNum: num }
    }, { merge: true });
    alert("基本情報を保存しました！");
  } catch (err) {
    console.error("プロフィール保存エラー:", err);
  }
};

// 初期表示処理
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('staffNameInput').value = currentStaffName;
  document.getElementById('staffNameDisplay').textContent = currentStaffName;

  // お知らせのリアルタイム受信
  onSnapshot(doc(db, "settings", "notice"), (docSnap) => {
    if (docSnap.exists()) {
      document.getElementById('noticeContent').textContent = docSnap.data().text || "お知らせはありません";
    }
  });
});