const display = document.getElementById('pass-display');
const lengthSlider = document.getElementById('length-slider');
const lengthOutput = document.getElementById('len-output');
const qtyInput = document.getElementById('qty-input');
const qtySync = document.querySelector('.qty-sync');
const strengthFill = document.getElementById('st-fill');
const strengthLabel = document.getElementById('st-label');
const historyList = document.getElementById('history-list');

const charSets = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    nums: '0123456789',
    syms: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

// Sync controls
lengthSlider.addEventListener('input', (e) => lengthOutput.innerText = e.target.value);
qtyInput.addEventListener('input', (e) => qtySync.innerText = e.target.value);

// Core Secure Logic
function generateKey() {
    let charset = '';
    if (document.getElementById('upper').checked) charset += charSets.upper;
    if (document.getElementById('lower').checked) charset += charSets.lower;
    if (document.getElementById('nums').checked) charset += charSets.nums;
    if (document.getElementById('syms').checked) charset += charSets.syms;

    if (!charset) return "Select Options";

    const len = parseInt(lengthSlider.value);
    const typedArray = new Uint32Array(len);
    window.crypto.getRandomValues(typedArray);

    let result = '';
    for (let i = 0; i < len; i++) {
        result += charset.charAt(typedArray[i] % charset.length);
    }
    return result;
}

// Single Generation
document.getElementById('generate-btn').addEventListener('click', () => {
    const pwd = generateKey();
    display.value = pwd;
    updateStrength(pwd);
    addToHistory(pwd);
    gsap.fromTo(".main-card", {scale: 0.98}, {scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)"});
});

// Bulk Generation
document.getElementById('bulk-btn').addEventListener('click', () => {
    const qty = parseInt(qtyInput.value) || 1;
    historyList.innerHTML = '';
    for (let i = 0; i < qty; i++) {
        setTimeout(() => {
            const pwd = generateKey();
            addToHistory(pwd);
        }, i * 40);
    }
});

function addToHistory(pwd) {
    if (historyList.querySelector('.empty-msg')) historyList.innerHTML = '';
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${pwd}</span>
        <div class="li-actions">
            <button onclick="copyText('${pwd}', this)"><i class="fas fa-copy"></i></button>
            <button onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button>
        </div>
    `;
    historyList.prepend(li);
    gsap.from(li, { opacity: 0, x: -20, duration: 0.4 });
}

function updateStrength(pwd) {
    let score = 0;
    if (pwd.length > 16) score++;
    if (/[A-Z]/.test(pwd) && /[!@#$%^&*]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) && pwd.length > 10) score++;
    
    const settings = [
        { w: '25%', c: '#ff4444', t: 'WEAK' },
        { w: '50%', c: '#ffbb33', t: 'FAIR' },
        { w: '75%', c: '#00ccff', t: 'GOOD' },
        { w: '100%', c: '#00ff88', t: 'SECURE' }
    ];
    const res = settings[score];
    strengthFill.style.width = res.w;
    strengthFill.style.backgroundColor = res.c;
    strengthLabel.innerText = `Strength: ${res.t}`;
    strengthLabel.style.color = res.c;
}

function copyText(text, btn) {
    navigator.clipboard.writeText(text);
    const icon = btn.querySelector('i');
    icon.className = 'fas fa-check';
    setTimeout(() => icon.className = 'fas fa-copy', 1500);
}

// Export
document.getElementById('export-btn').addEventListener('click', () => {
    const txt = Array.from(historyList.querySelectorAll('li span')).map(s => s.innerText).join('\n');
    const blob = new Blob([txt], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'guardx_passwords.txt';
    a.click();
});