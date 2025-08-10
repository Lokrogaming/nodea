const mapContainer = document.getElementById("map-container");
const uploadBtn = document.getElementById("upload-btn");
const uploadInput = document.getElementById("upload-input");
const downloadBtn = document.getElementById("download-btn");

const popup = document.getElementById("popup");
const confirmDownload = document.getElementById("confirm-download");
const cancelDownload = document.getElementById("cancel-download");

const metaAuthor = document.getElementById("meta-author");
const metaDescription = document.getElementById("meta-description");

let mapData = Array(10).fill().map(() => Array(10).fill(0));
let metaData = { author: "-", description: "-", password: "" };

// Map generieren
function generateMap() {
    mapContainer.innerHTML = "";
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            if (mapData[y][x] === 1) tile.classList.add("active");
            tile.addEventListener("click", () => {
                mapData[y][x] = mapData[y][x] === 1 ? 0 : 1;
                tile.classList.toggle("active");
            });
            mapContainer.appendChild(tile);
        }
    }
}

// Upload
uploadBtn.addEventListener("click", () => uploadInput.click());
uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const loaded = JSON.parse(e.target.result);
        mapData = loaded.map;
        metaData = loaded.meta || { author: "-", description: "-", password: "" };
        metaAuthor.textContent = metaData.author || "-";
        metaDescription.textContent = metaData.description || "-";
        generateMap();
    };
    reader.readAsText(file);
});

// Download
downloadBtn.addEventListener("click", () => {
    popup.classList.remove("hidden");
});

confirmDownload.addEventListener("click", () => {
    metaData.author = document.getElementById("input-author").value || "-";
    metaData.description = document.getElementById("input-description").value || "-";
    metaData.password = document.getElementById("input-password").value || "";

    const blob = new Blob([JSON.stringify({ map: mapData, meta: metaData }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "map.json";
    a.click();
    popup.classList.add("hidden");
});

cancelDownload.addEventListener("click", () => {
    popup.classList.add("hidden");
});

// Start
generateMap();

