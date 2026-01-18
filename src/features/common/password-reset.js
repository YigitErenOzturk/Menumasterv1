import { authService } from '../../api/authService.js';

const DOM = {
    steps: {
        email: document.getElementById("stepEmail"),
        reset: document.getElementById("stepReset") // Steps
    },
    inputs: {
        email: document.getElementById("email"),
        code: document.getElementById("code"),
        p1: document.getElementById("p1"),
        p2: document.getElementById("p2")
    },
    feedback: {
        email: document.getElementById("emailInfo"),
        reset: document.getElementById("resetErr"),
        success: document.getElementById("resetOk")
    },
    btns: {
        send: document.getElementById("sendBtn"),
        reset: document.getElementById("resetBtn")
    }
};

const showStep = (stepKey) => {
    Object.values(DOM.steps).forEach(s => s.classList.add("hidden"));
    DOM.steps[stepKey].classList.remove("hidden");
};

const setBtnLoading = (btn, isLoading, loadingText = "İşleniyor...") => {
    btn.disabled = isLoading;
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = loadingText;
    } else {
        btn.textContent = btn.dataset.originalText || "Gönder";
    }
};

// Step One
DOM.btns.send.onclick = async () => {
    const email = DOM.inputs.email.value.trim();
    if (!email) return (DOM.feedback.email.textContent = "Lütfen e-posta girin.");

    try {
        setBtnLoading(DOM.btns.send, true, "Sending...");
        await authService.forgotPassword(email);
        
        // Keep e mail to use next step
        localStorage.setItem("fp_email", email);
        showStep('reset'); // next to new page
    } catch (err) {
        DOM.feedback.email.textContent = err.response?.data?.message || "Kod gönderilemedi.";
    } finally {
        setBtnLoading(DOM.btns.send, false);
    }
};

// step 2
DOM.btns.reset.onclick = async () => {
    const email = localStorage.getItem("fp_email");
    const code = DOM.inputs.code.value.trim();
    const pass = DOM.inputs.p1.value;

    if (!code) return (DOM.feedback.reset.textContent = "Enter Code");
    if (pass.length < 6) return (DOM.feedback.reset.textContent = "The password must be at least 6 characters long..");
    if (pass !== DOM.inputs.p2.value) return (DOM.feedback.reset.textContent = "Passwords Are Not Match.");

    try {
        setBtnLoading(DOM.btns.reset, true, "Updating...");
        // Call
        await authService.resetPassword(code, pass, email);
        
        DOM.feedback.success.textContent = "Password Updated ✅";
        localStorage.removeItem("fp_email");
        
        setTimeout(() => window.location.href = "login.html", 2000);
    } catch (err) {
        DOM.feedback.reset.textContent = err.response?.data?.message || "Password Could Not Change.";
    } finally {
        setBtnLoading(DOM.btns.reset, false);
    }
};

// Remember where you left
(function init() {
    if (localStorage.getItem("fp_email")) showStep('reset');
    else showStep('email');
})();

const fpModal = document.getElementById("fpModal");
const fpMsg = document.getElementById("fpMsg");

const fpStepEmail = document.getElementById("fpStepEmail");
const fpStepCode = document.getElementById("fpStepCode");
const fpStepNewPass = document.getElementById("fpStepNewPass");

const fpEmail = document.getElementById("fpEmail");
const fpCode = document.getElementById("fpCode");
const fpNewPass = document.getElementById("fpNewPass");
const fpNewPass2 = document.getElementById("fpNewPass2");

const fpSendCode = document.getElementById("fpSendCode");
const fpVerifyCode = document.getElementById("fpVerifyCode");
const fpResetPass = document.getElementById("fpResetPass");
const fpClose = document.getElementById("fpClose");

// forgotBtn senin butonun
if (forgotBtn) {
  forgotBtn.onclick = () => {
    openFpModal();
  };
}

function openFpModal() {
  fpModal.classList.remove("hidden");
  fpModal.classList.add("flex");
  fpMsg.textContent = "";

  // Step reset
  fpStepEmail.classList.remove("hidden");
  fpStepCode.classList.add("hidden");
  fpStepNewPass.classList.add("hidden");

  fpEmail.value = "";
  fpCode.value = "";
  fpNewPass.value = "";
  fpNewPass2.value = "";
}

function closeFpModal() {
  fpModal.classList.add("hidden");
  fpModal.classList.remove("flex");
}

fpClose.onclick = closeFpModal;

// Step 1: send code
fpSendCode.onclick = async () => {
  try {
    fpMsg.textContent = "";
    const email = fpEmail.value.trim();
    if (!email) return showError("Email required.");

    // ✅ service function
    await restaurantService.sendResetCode(email);

    // Step 2
    fpStepEmail.classList.add("hidden");
    fpStepCode.classList.remove("hidden");
    showOk("Code sent. Check your email.");
  } catch (e) {
    showError("Failed to send code.");
  }
};

// Step 2: verify code 
fpVerifyCode.onclick = async () => {
  try {
    fpMsg.textContent = "";
    const email = fpEmail.value.trim();
    const code = fpCode.value.trim();
    if (!code) return showError("Code required.");

   

    // Step 3
    fpStepCode.classList.add("hidden");
    fpStepNewPass.classList.remove("hidden");
    showOk("Code accepted. Set a new password.");
  } catch (e) {
    showError("Invalid code.");
  }
};

// Step 3: reset password
fpResetPass.onclick = async () => {
  try {
    fpMsg.textContent = "";
    const email = fpEmail.value.trim();
    const code = fpCode.value.trim();
    const p1 = fpNewPass.value;
    const p2 = fpNewPass2.value;

    if (!p1 || !p2) return showError("Password required.");
    if (p1 !== p2) return showError("Passwords do not match.");
    if (p1.length < 6) return showError("Password too short.");

    // ✅ 
    await restaurantService.resetPassword(email, code, p1);

    showOk("Password reset successful.");
    setTimeout(closeFpModal, 800);
  } catch (e) {
    showError("Failed to reset password.");
  }
};

function showError(msg) {
  fpMsg.textContent = msg;
  fpMsg.className = "mt-3 text-center text-sm text-red-600";
}
function showOk(msg) {
  fpMsg.textContent = msg;
  fpMsg.className = "mt-3 text-center text-sm text-green-600";
}
