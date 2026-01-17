// =========================
// CONFIG
// =========================
const API_URL = "http://localhost:3000/api/auth"; 
// API

// =========================
// ELEMENTS
// =========================
const stepEmail = document.getElementById("stepEmail");
const stepCode = document.getElementById("stepCode");
const stepReset = document.getElementById("stepReset");

const emailInput = document.getElementById("email");
const codeInput = document.getElementById("code");
const p1Input = document.getElementById("p1");
const p2Input = document.getElementById("p2");

const emailInfo = document.getElementById("emailInfo");
const codeErr = document.getElementById("codeErr");
const resetErr = document.getElementById("resetErr");
const resetOk = document.getElementById("resetOk");

const sendBtn = document.getElementById("sendBtn");
const verifyBtn = document.getElementById("verifyBtn");
const resetBtn = document.getElementById("resetBtn");

// =========================
// HELPERS
// =========================
function showStep(which) {
  stepEmail.classList.add("hidden");
  stepCode.classList.add("hidden");
  stepReset.classList.add("hidden");
  which.classList.remove("hidden");
}

function setLoading(btn, loading, textWhenLoading = "Loading...") {
  btn.disabled = loading;
  btn.style.opacity = loading ? "0.7" : "1";
  btn.textContent = loading ? textWhenLoading : btn.getAttribute("data-text");
}

// Hide Button Writings
sendBtn.setAttribute("data-text", sendBtn.textContent);
verifyBtn.setAttribute("data-text", verifyBtn.textContent);
resetBtn.setAttribute("data-text", resetBtn.textContent);

// =========================
// 1) SEND EMAIL
// =========================
sendBtn.addEventListener("click", async () => {
  emailInfo.textContent = "";
  codeErr.textContent = "";
  resetErr.textContent = "";
  resetOk.textContent = "";

  const email = emailInput.value.trim();
  if (!email) {
    emailInfo.textContent = "Please Write Your E-Mail.";
    return;
  }

  try {
    setLoading(sendBtn, true, "Sending...");

    // ✅ API CALL 1
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    // Some Backend will back enpty if no safe
    let data = {};
    try { data = await res.json(); } catch (_) {}

    if (!res.ok) {
      emailInfo.textContent = (data && data.message) ? data.message : "Code Could Not Send.";
      return;
    }

    localStorage.setItem("fp_email", email);
    emailInfo.textContent = "Code Sent ✅";
    showStep(stepCode);

  } catch (err) {
    emailInfo.textContent = "Server Doesnt Work ❌";
  } finally {
    setLoading(sendBtn, false);
  }
});

// =========================
// 2) VERIFY CODE
// =========================
verifyBtn.addEventListener("click", async () => {
  codeErr.textContent = "";
  resetErr.textContent = "";
  resetOk.textContent = "";

  const email = localStorage.getItem("fp_email");
  const code = codeInput.value.trim();

  if (!email) {
    showStep(stepEmail);
    emailInfo.textContent = "E-Mail Could Not Find.";
    return;
  }

  if (!code) {
    codeErr.textContent = "Enter Your Code.";
    return;
  }

  try {
    setLoading(verifyBtn, true, "Verifying...");

    // ✅ API CALL 2
    const res = await fetch(`${API_URL}/verify-reset-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });

    const data = await res.json();

    if (!res.ok) {
      codeErr.textContent = data.message || "Code Is Wrong ❌";
      return;
    }

  
    // { resetToken: "..." }
    if (!data.resetToken) {
      codeErr.textContent = "Error Token";
      return;
    }

    localStorage.setItem("reset_token", data.resetToken);
    showStep(stepReset);

  } catch (err) {
    codeErr.textContent = "Server Error ❌";
  } finally {
    setLoading(verifyBtn, false);
  }
});

// =========================
// 3) RESET PASSWORD
// =========================
resetBtn.addEventListener("click", async () => {
  resetErr.textContent = "";
  resetOk.textContent = "";

  const resetToken = localStorage.getItem("reset_token");
  const p1 = p1Input.value;
  const p2 = p2Input.value;

  if (!resetToken) {
    showStep(stepEmail);
    emailInfo.textContent = "Try Again No Token.";
    return;
  }

  if (p1.length < 6) {
    resetErr.textContent = "Password Must be minimum 6 chracter.";
    return;
  }

  if (p1 !== p2) {
    resetErr.textContent = "Both Password Boxes Are Written Different.";
    return;
  }

  try {
    setLoading(resetBtn, true, "Saving...");

    // ✅ API CALL 3
    const res = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetToken, newPassword: p1 })
    });

    const data = await res.json();

    if (!res.ok) {
      resetErr.textContent = data.message || "Password Could Not Update ❌";
      return;
    }

    resetOk.textContent = "Password Updated ✅";

    // Temizlik
    localStorage.removeItem("fp_email");
    localStorage.removeItem("reset_token");

    // Send them to login
    setTimeout(() => window.location.href = "login.html", 1200);

  } catch (err) {
    resetErr.textContent = "Server Error ❌";
  } finally {
    setLoading(resetBtn, false);
  }
});

// If page refresh it will send them the place they were
(function restoreStep() {
  const email = localStorage.getItem("fp_email");
  const token = localStorage.getItem("reset_token");

  if (token) showStep(stepReset);
  else if (email) showStep(stepCode);
  else showStep(stepEmail);
})();
