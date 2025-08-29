// /js/catalog.js
export async function loadCatalog(url = "data/cards.json") {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error("cards.json 로드 실패");
  const list = await res.json();
  // 필드 보정
  return list.map((x) => ({
    id: String(x.id),
    name: String(x.name),
    pw: Math.max(0, Number(x.pw) || 0),
    lf: Math.max(0, Number(x.lf) || 0),
    image: String(x.image || ""),
    sprite: x.sprite || { type: "none" },
  }));
}
