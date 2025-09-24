// Történetek betöltése az admin listából
async function loadStories() {
  const res = await fetch("/admin/list");
  const data = await res.json();
  const grid = document.getElementById("storyGrid");
  grid.innerHTML = "";

  data.stories.forEach((story) => {
    const div = document.createElement("div");
    div.className = "card";

    // Borítókép (ha nincs, akkor nincskep.png)
    const coverImg = `/kepek/${story.name}/${story.name}.png`;

    div.innerHTML = `
      <img class="cover" src="${coverImg}" onerror="this.src='/kepek/nincskep.png'" alt="${story.name} borítókép">
      <h2>${story.title}</h2>
      <img class="qr" src="${story.qr}" alt="QR kód ${story.name}-hez" onclick="showModal('${story.qr}')">
    `;

    grid.appendChild(div);
  });
}

// Modal megjelenítése nagy QR-hoz
function showModal(src) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  modalImg.src = src;  // teljes felbontású QR
  modal.style.display = "flex";
}

// Modal bezárása kattintásra
document.getElementById("modal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

// Oldal betöltésekor rögtön töltsük be a listát
loadStories();
