// /js/gallery.js
export function openGallery(catalog, slot, onPick)
{
    const root = document.getElementById("gallery");
    const grid = document.getElementById("galleryGrid");
    const title = document.getElementById("galleryTitle");
    const closeBtn = document.getElementById("galleryClose");

    title.textContent = `카드 선택 (슬롯 ${slot})`;
    grid.innerHTML = "";

    catalog.forEach(card => {
        const tile = document.createElement("button");
        tile.className = "card-tile";
        tile.innerHTML = `
          <img src="${card.image}" alt="${card.name}" onerror="this.style.display='none'">
          <div class="meta">
            <strong>${card.name}</strong>
            <span>PW ${card.pw.toLocaleString("ko-KR")} / LF ${card.lf.toLocaleString("ko-KR")}</span>
            <span style="color:#9ca3af">ID: ${card.id}</span>
          </div>
        `;
        tile.addEventListener("click", () => {
            onPick(card, slot);
            root.classList.add("hidden");
            root.setAttribute("aria-hidden", "true");
        });
        grid.appendChild(tile);
    });

    root.classList.remove("hidden");
    root.setAttribute("aria-hidden", "false");

    closeBtn.onclick = () => {
        root.classList.add("hidden");
        root.setAttribute("aria-hidden", "true");
    };
    root.onclick = (e) => {
        if (e.target === root) {
            root.classList.add("hidden");
            root.setAttribute("aria-hidden", "true");
        }
    };
}
