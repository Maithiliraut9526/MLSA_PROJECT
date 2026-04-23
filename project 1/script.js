const display = document.getElementById('password-display');
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

lengthSlider.addEventListener('input', (e) => {
    lengthVal.innerText = e.target.value;
});

function generatePassword() {
    let charset = '';
    if (document.getElementById('uppercase').checked) charset += charSets.uppercase;
    if (document.getElementById('lowercase').checked) charset += charSets.lowercase;
    if (document.getElementById('numbers').checked) charset += charSets.numbers;
    if (document.getElementById('symbols').checked) charset += charSets.symbols;

    if (!charset) return 'Select Options!';

    let password = '';
    for (let i = 0; i < lengthSlider.value; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    display.value = password;
    checkStrength(password);
}

function checkStrength(pwd) {
    let strength = 0;
    if (pwd.length > 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    const colors = ['#ef4444', '#f59e0b', '#38bdf8', '#22c55e'];
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];
    
    strengthBar.style.width = (strength + 1) * 20 + '%';
    strengthBar.style.backgroundColor = colors[strength];
    strengthText.innerText = `Strength: ${texts[strength]}`;
}

document.getElementById('generate-btn').addEventListener('click', generatePassword);

document.getElementById('save-btn').addEventListener('click', () => {
    const blob = new Blob([display.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'password.txt';
    a.click();
});

document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(display.value);
    alert('Copied to clipboard!');
});