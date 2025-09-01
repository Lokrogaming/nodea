const editor = document.getElementById('editor');
const downloadBtn = document.getElementById('downloadBtn');
const uploadInput = document.getElementById('uploadInput');

const downloadPopup = document.getElementById('downloadPopup');
const confirmDownload = document.getElementById('confirmDownload');
const cancelDownload = document.getElementById('cancelDownload');

const passwordPopup = document.getElementById('passwordPopup');
const confirmPassword = document.getElementById('confirmPassword');
const cancelPassword = document.getElementById('cancelPassword');

const mapAuthor = document.getElementById('map-author');
const mapDescription = document.getElementById('map-description');

let mapData = Array(10).fill().map(() => Array(10).fill(0));
let currentFilePassword = null;

// Editor erstellen
function renderEditor() {
    editor.innerHTML = '';
    mapData.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement('div');
            div.className = 'cell';
            div.style.background = cell ? '#4caf50' : 'white';
            div.addEventListener('click', () => {
                mapData[y][x] = mapData[y][x] ? 0 : 1;
                renderEditor();
            });
            editor.appendChild(div);
        });
    });
}
renderEditor();

// Download starten
downloadBtn.addEventListener('click', () => {
    downloadPopup.classList.remove('hidden');
});

// Download bestätigen
confirmDownload.addEventListener('click', () => {
    const author = document.getElementById('authorInput').value;
    const description = document.getElementById('descInput').value;
    const password = document.getElementById('passwordInput').value;

    const fileData = {
        author,
        description,
        password,
        map: mapData
    };

    const blob = new Blob([JSON.stringify(fileData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "map.json";
    a.click();
    URL.revokeObjectURL(url);

    downloadPopup.classList.add('hidden');
});

// Download abbrechen
cancelDownload.addEventListener('click', () => {
    downloadPopup.classList.add('hidden');
});

// Datei hochladen
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const data = JSON.parse(reader.result);
        if (data.password) {
            currentFilePassword = data.password;
            passwordPopup.classList.remove('hidden');
            passwordPopup.dataset.mapData = reader.result;
        } else {
            loadMap(data);
        }
    };
    reader.readAsText(file);
});

// Passwort bestätigen
confirmPassword.addEventListener('click', () => {
    const inputPass = document.getElementById('passwordCheckInput').value;
    const data = JSON.parse(passwordPopup.dataset.mapData);
    if (inputPass === data.password) {
        loadMap(data);
        passwordPopup.classList.add('hidden');
    } else {
        alert("Falsches Passwort!");
    }
});

// Passwort abbrechen
cancelPassword.addEventListener('click', () => {
    passwordPopup.classList.add('hidden');
});

function loadMap(data) {
    mapData = data.map;
    mapAuthor.textContent = data.author ? `Autor: ${data.author}` : '';
    mapDescription.textContent = data.description ? `Beschreibung: ${data.description}` : '';
    renderEditor();
}
