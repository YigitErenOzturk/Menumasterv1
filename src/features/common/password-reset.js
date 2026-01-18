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