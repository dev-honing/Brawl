// /js/catalog.js
export async function loadCatalog(url = "data/cards.json") {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error("cards.json �ε� ����");
  const list = await res.json();
  // �ʵ� ����
  return list.map((x) => ({
    id: String(x.id),
    name: String(x.name),
    pw: Math.max(0, Number(x.pw) || 0),
    lf: Math.max(0, Number(x.lf) || 0),
    image: String(x.image || ""),
    sprite: x.sprite || { type: "none" },
  }));
}
