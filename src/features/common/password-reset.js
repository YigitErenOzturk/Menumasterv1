import { authService } from '../../api/authService.js';

const DOM = {
    steps: {
        email: document.getElementById("stepEmail"),
        reset: document.getElementById("stepReset") // Artık kod ve yeni şifre aynı ekranda olabilir
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

// 1. ADIM: E-posta Gönder (Şifre sıfırlama kodu iste)
DOM.btns.send.onclick = async () => {
    const email = DOM.inputs.email.value.trim();
    if (!email) return (DOM.feedback.email.textContent = "Lütfen e-posta girin.");

    try {
        setBtnLoading(DOM.btns.send, true, "Gönderiliyor...");
        await authService.forgotPassword(email);
        
        // E-postayı sonraki adımda kullanmak için sakla
        localStorage.setItem("fp_email", email);
        showStep('reset'); // Doğrudan kod ve yeni şifre girme ekranına geç
    } catch (err) {
        DOM.feedback.email.textContent = err.response?.data?.message || "Kod gönderilemedi.";
    } finally {
        setBtnLoading(DOM.btns.send, false);
    }
};

// 2. ADIM: Kod + Yeni Şifre ile Sıfırla
DOM.btns.reset.onclick = async () => {
    const email = localStorage.getItem("fp_email");
    const code = DOM.inputs.code.value.trim();
    const pass = DOM.inputs.p1.value;

    if (!code) return (DOM.feedback.reset.textContent = "Lütfen onay kodunu girin.");
    if (pass.length < 6) return (DOM.feedback.reset.textContent = "Şifre en az 6 karakter olmalı.");
    if (pass !== DOM.inputs.p2.value) return (DOM.feedback.reset.textContent = "Şifreler eşleşmiyor.");

    try {
        setBtnLoading(DOM.btns.reset, true, "Güncelleniyor...");
        // Senin servis yapına uygun çağrı: code, newPassword, email
        await authService.resetPassword(code, pass, email);
        
        DOM.feedback.success.textContent = "Şifre Başarıyla Güncellendi ✅";
        localStorage.removeItem("fp_email");
        
        setTimeout(() => window.location.href = "login.html", 2000);
    } catch (err) {
        DOM.feedback.reset.textContent = err.response?.data?.message || "Şifre sıfırlanamadı.";
    } finally {
        setBtnLoading(DOM.btns.reset, false);
    }
};

// Sayfa yenilense de kaldığı yeri hatırla
(function init() {
    if (localStorage.getItem("fp_email")) showStep('reset');
    else showStep('email');
})();