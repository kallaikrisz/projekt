// A történet neve az URL paraméterből
const urlParams = new URLSearchParams(window.location.search);
let storyName = urlParams.get("story") || "default";

let storyData = null;
let currentChapter = null;

// Történet betöltése a szerverről
async function loadStory() {
  try {
    const res = await fetch(`/story/${storyName}`);
    storyData = await res.json();

    // Háttérzene beállítása
    const audio = document.getElementById("bgMusic");
    audio.src = `/hangok/${storyName}.mp3`;
    audio.play().catch(() => {
      console.log("A zene csak interakció után indulhat el (mobil korlátozás).");
    });

    // Induló fejezet kirajzolása
    renderChapter(storyData.start);
  } catch (err) {
    document.getElementById("story").innerHTML =
      "<p style='color:red;'>Nem sikerült betölteni a történetet.</p>";
  }
}

// Fejezet kirajzolása
function renderChapter(chapterId) {
  currentChapter = storyData.chapters[chapterId];
  const storyDiv = document.getElementById("story");

  // Kép betöltése (ha hiányzik → nincskep.png)
  const imgPath = `/kepek/${storyName}/${storyName}${chapterId}.png`;
  const imgHtml = `<img src="${imgPath}" onerror="this.src='/kepek/nincskep.png'">`;

  // Fejezet tartalom
  let html = `<h1>${storyData.title}</h1>`;
  html += imgHtml;
  html += `<p>${currentChapter.text}</p>`;

  // Választási lehetőségek
  if (currentChapter.choices && currentChapter.choices.length > 0) {
    html += `<div class="choices">`;
    currentChapter.choices.forEach(choice => {
      html += `<button onclick="renderChapter('${choice.next}')">${choice.label}</button>`;
    });
    html += `</div>`;
  } else {
    html += `<p><em>A történet véget ért.</em></p>`;
  }

  storyDiv.innerHTML = html;
}

// Hangvezérlés (mute/unmute)
document.getElementById("audioControl").addEventListener("click", () => {
  const audio = document.getElementById("bgMusic");
  if (audio.paused) {
    audio.play();
    document.getElementById("audioControl").textContent = "🔊";
  } else {
    audio.pause();
    document.getElementById("audioControl").textContent = "🔇";
  }
});

// Indítás
loadStory();
