(() => {
  // DOM
  const mapEl = document.getElementById('map');
  const colsInput = document.getElementById('colsInput');
  const rowsInput = document.getElementById('rowsInput');
  const newMapBtn = document.getElementById('newMapBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadInput = document.getElementById('uploadInput');
  const downloadBtn = document.getElementById('downloadBtn');

  const downloadPopup = document.getElementById('downloadPopup');
  const confirmDownload = document.getElementById('confirmDownload');
  const cancelDownload = document.getElementById('cancelDownload');
  const authorInput = document.getElementById('authorInput');
  const descInput = document.getElementById('descInput');
  const passwordInput = document.getElementById('passwordInput');

  const passwordPopup = document.getElementById('passwordPopup');
  const passwordCheckInput = document.getElementById('passwordCheckInput');
  const confirmPassword = document.getElementById('confirmPassword');
  const cancelPassword = document.getElementById('cancelPassword');

  const metaAuthor = document.getElementById('meta-author');
  const metaDesc = document.getElementById('meta-desc');

  // State
  let rows = clampInt(parseInt(rowsInput.value), 1, 100) || 10;
  let cols = clampInt(parseInt(colsInput.value), 1, 100) || 10;
  let map = createEmpty(rows, cols);
  let meta = { author: '', description: '', password: '' };

  // For password-gated uploads
  let _pendingData = null;

  // Helpers
  function clampInt(n, min, max) {
    return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
  }
  function createEmpty(r, c) {
    return Array.from({ length: r }, () => Array(c).fill(0));
  }
  function setColsVar(c) {
    mapEl.style.setProperty('--cols', String(c));
  }

  // Render
  function renderMap() {
    setColsVar(cols);
    mapEl.innerHTML = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell' + (map[y][x] ? ' active' : '');
        cell.dataset.x = x; cell.dataset.y = y;
        cell.addEventListener('click', () => {
          map[y][x] = map[y][x] ? 0 : 1;
          cell.classList.toggle('active');
        });
        mapEl.appendChild(cell);
      }
    }
  }

  // Meta UI
  function renderMeta() {
    metaAuthor.textContent = `Autor: ${meta.author ? meta.author : '–'}`;
    metaDesc.textContent   = `Beschreibung: ${meta.description ? meta.description : '–'}`;
  }

  // New map
  newMapBtn.addEventListener('click', () => {
    rows = clampInt(parseInt(rowsInput.value), 1, 100);
    cols = clampInt(parseInt(colsInput.value), 1, 100);
    map = createEmpty(rows, cols);
    renderMap();
  });

  // Upload
  uploadBtn.addEventListener('click', () => uploadInput.click());
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'));

        // akzeptiere {map:[][], author, description, password} ODER {mapData:[][], meta:{...}}
        const incomingMap = Array.isArray(data.map) ? data.map
                          : Array.isArray(data.mapData) ? data.mapData
                          : null;

        if (!incomingMap || !Array.isArray(incomingMap[0])) {
          alert('Ungültiges Map-Format.');
          return;
        }

        // Passwort vorhanden?
        const pass = (typeof data.password === 'string' && data.password.length) ? data.password
                   : (data.meta && typeof data.meta.password === 'string' && data.meta.password.length) ? data.meta.password
                   : '';

        _pendingData = {
          map: incomingMap,
          author: data.author || (data.meta && data.meta.author) || '',
          description: data.description || (data.meta && data.meta.description) || '',
          password: pass
        };

        if (pass) {
          // Zeige Passwort-Dialog nur wenn vorhanden
          passwordCheckInput.value = '';
          passwordPopup.classList.remove('hidden');
        } else {
          applyLoaded(_pendingData);
          _pendingData = null;
        }
      } catch (err) {
        console.error(err);
        alert('Datei konnte nicht gelesen werden.');
      }
    };
    reader.readAsText(file);
  });

  confirmPassword.addEventListener('click', () => {
    if (!_pendingData) return hidePasswordPopup();
    const input = passwordCheckInput.value || '';
    if (input === _pendingData.password) {
      applyLoaded(_pendingData);
      _pendingData = null;
      hidePasswordPopup();
    } else {
      alert('Falsches Passwort.');
    }
  });
  cancelPassword.addEventListener('click', hidePasswordPopup);
  function hidePasswordPopup(){
    passwordPopup.classList.add('hidden');
    _pendingData = null;
  }

  function applyLoaded(data) {
    map = data.map;
    rows = map.length;
    cols = map[0].length;
    meta = { author: data.author || '', description: data.description || '', password: data.password || '' };
    rowsInput.value = rows;
    colsInput.value = cols;
    renderMeta();
    renderMap();
  }

  // Download (Popup nur per Button öffnen)
  downloadBtn.addEventListener('click', () => {
    // Felder mit bestehenden Meta vorbelegen
    authorInput.value = meta.author || '';
    descInput.value = meta.description || '';
    passwordInput.value = meta.password || '';
    downloadPopup.classList.remove('hidden');
  });

  cancelDownload.addEventListener('click', () => downloadPopup.classList.add('hidden'));

  confirmDownload.addEventListener('click', () => {
    meta.author = authorInput.value || '';
    meta.description = descInput.value || '';
    meta.password = passwordInput.value || '';

    const payload = {
      author: meta.author,
      description: meta.description,
      password: meta.password,
      map
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    renderMeta();
    downloadPopup.classList.add('hidden');
  });

  // Close popups on overlay click (UX)
  [downloadPopup, passwordPopup].forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });

  // Init
  renderMeta();
  renderMap();
})();
