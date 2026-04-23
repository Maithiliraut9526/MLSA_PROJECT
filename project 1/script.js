const display = document.getElementById('pass-display');
const lengthSlider = document.getElementById('length-slider');
const lenVal = document.getElementById('len-val');
const historyList = document.getElementById('history-list');
const qtyInput = document.getElementById('qty-input');

lengthSlider.addEventListener('input', (e) => lenVal.innerText = e.target.value);

function generateSecureKey() {
    const sets = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        nums: '0123456789',
        syms: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };
    let charset = '';
    if (document.getElementById('upper').checked) charset += sets.upper;
    if (document.getElementById('lower').checked) charset += sets.lower;
    if (document.getElementById('nums').checked) charset += sets.nums;
    if (document.getElementById('syms').checked) charset += sets.syms;
    if (!charset) return 'ERROR';

    const len = parseInt(lengthSlider.value);
    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    let pwd = '';
    for (let i = 0; i < len; i++) pwd += charset.charAt(array[i] % charset.length);
    return pwd;
}

document.getElementById('generate-btn').addEventListener('click', () => {
    const qty = parseInt(qtyInput.value) || 1;
    // Glow Animation
    gsap.fromTo(".output-shield", {boxShadow: "0 0 0px var(--cyan)"}, {boxShadow: "0 0 30px rgba(0, 242, 255, 0.2)", duration: 0.5});

    for (let i = 0; i < qty; i++) {
        setTimeout(() => {
            const res = generateSecureKey();
            if (i === 0) {
                display.value = res;
                updateStrength(res);
            }
            addLog(res);
        }, i * 50);
    }
});

function addLog(pwd) {
    const div = document.createElement('div');
    div.className = 'log-chip';
    div.innerHTML = `<span>${pwd}</span> <i class="fas fa-copy" style="cursor:pointer" onclick="navigator.clipboard.writeText('${pwd}')"></i>`;
    historyList.prepend(div);
    gsap.from(div, {opacity: 0, y: 10, duration: 0.4});
}

function updateStrength(pwd) {
    const fill = document.getElementById('st-fill');
    const text = document.getElementById('st-text');
    let strength = 0;
    if (pwd.length > 20) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    
    const levels = [
        {w: '33%', c: '#ff4b2b', t: 'VULNERABLE'},
        {w: '66%', c: '#ffb400', t: 'SECURE'},
        {w: '100%', c: '#00f2ff', t: 'MILITARY-GRADE'}
    ];
    const lvl = levels[strength] || levels[0];
    fill.style.width = lvl.w;
    fill.style.backgroundColor = lvl.c;
    fill.style.boxShadow = `0 0 15px ${lvl.c}`;
    text.innerText = lvl.t;
    text.style.color = lvl.c;
}

document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(display.value);
    gsap.fromTo("#copy-btn", {scale: 1.5}, {scale: 1, duration: 0.2});
});