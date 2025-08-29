// /js/main.js
import { loadCatalog } from "./catalog.js";
import { openGallery } from "./gallery.js";
import { runRound } from "./simulator.js";
import { logLine, resetLog } from "./utils.js";




// DOM
const $ = s => document.querySelector(s);
const a_pw = $("#a_pw"), a_lf = $("#a_lf");
const b_pw = $("#b_pw"), b_lf = $("#b_lf");
const rulesetSelect = $("#rulesetSelect");
const clampZero = $("#clampZero");
const btnRound = $("#btnRound"), btnAuto = $("#btnAuto"), btnReset = $("#btnReset");
const log = $("#log"), statusEl = $("#status");

const unitA = $("#unitA"), unitB = $("#unitB");
const A_pw_val = $("#A_pw_val"), B_pw_val = $("#B_pw_val");
const A_hp_fill = $("#A_hp_fill"), B_hp_fill = $("#B_hp_fill");
const A_hp_text = $("#A_hp_text"), B_hp_text = $("#B_hp_text");
const A_floaters = $("#A_floaters"), B_floaters = $("#B_floaters");
const imgA = $("#imgA"), imgB = $("#imgB");
const pickButtons = document.querySelectorAll(".pick");

// 상태
let catalog = [];
let state = {
  A: { id: "A_default", name: "공격자 A", pw: 4000, lf: 6000, maxLF: 6000, image: "assets/img/발키리 쟈넷.png" },
  B: { id: "B_default", name: "방어자 B", pw: 3000, lf: 4000, maxLF: 4000, image: "assets/img/피어리스 멜로디.png" }
};

// 초기 카탈로그 로드
(async function initCatalog(){
  try {
    catalog = await loadCatalog("data/cards.json");
  } catch (e) {
    console.error(e);
    logLine(log, "cards.json 로드 실패: 샘플 카드만 사용합니다.");
  }
})();

// 슬롯에 카드 적용
function applyCardToSlot(slot, card) {
  const target = (slot === "A") ? state.A : state.B;
  target.id = card.id;
  target.name = card.name;
  target.pw = card.pw;
  target.lf = card.lf;
  target.maxLF = Math.max(target.maxLF, card.lf);
  target.image = card.image || "";

  if (slot === "A"){
    a_pw.value = target.pw; a_lf.value = target.lf; if (target.image) imgA.src = target.image;
  } else {
    b_pw.value = target.pw; b_lf.value = target.lf; if (target.image) imgB.src = target.image;
  }
  render();
  logLine(log, `[${slot}] ${target.name} 적용 (PW=${target.pw.toLocaleString("ko-KR")}, LF=${target.lf.toLocaleString("ko-KR")})`);
}

// 갤러리 열기 버튼
pickButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const slot = btn.getAttribute("data-slot"); // "A" or "B"
    openGallery(catalog, slot, applyCardToSlot);
  });
});

// 입력 → 상태 동기화
function syncFromInputs()
{
  state.A.pw = Math.max(0, Number(a_pw.value)||0);
  state.A.lf = Math.max(0, Number(a_lf.value)||0);
  state.A.maxLF = Math.max(state.A.maxLF, state.A.lf);

  state.B.pw = Math.max(0, Number(b_pw.value)||0);
  state.B.lf = Math.max(0, Number(b_lf.value)||0);
  state.B.maxLF = Math.max(state.B.maxLF, state.B.lf);

  render();
}

[a_pw,a_lf,b_pw,b_lf].forEach(el => el.addEventListener("change", syncFromInputs));

// 렌더
function render()
{
  A_pw_val.textContent = state.A.pw.toLocaleString("ko-KR");
  B_pw_val.textContent = state.B.pw.toLocaleString("ko-KR");

  const aLF = clampZero.checked ? Math.max(0, state.A.lf) : state.A.lf;
  const bLF = clampZero.checked ? Math.max(0, state.B.lf) : state.B.lf;
  const aPct = Math.max(0, Math.min(100, (aLF/state.A.maxLF)*100 || 0));
  const bPct = Math.max(0, Math.min(100, (bLF/state.B.maxLF)*100 || 0));
  A_hp_fill.style.width = aPct + "%";
  B_hp_fill.style.width = bPct + "%";
  A_hp_text.textContent = `LF ${aLF.toLocaleString("ko-KR")} / ${state.A.maxLF.toLocaleString("ko-KR")}`;
  B_hp_text.textContent = `LF ${bLF.toLocaleString("ko-KR")} / ${state.B.maxLF.toLocaleString("ko-KR")}`;

  unitA.classList.toggle("dead", aLF <= 0);
  unitB.classList.toggle("dead", bLF <= 0);
}

// 이펙트
function floater(targetEl, text, cls="hit")
{
  const f = document.createElement("div");
  f.className = `floater ${cls}`;
  f.textContent = text;
  targetEl.appendChild(f);
  setTimeout(()=>f.remove(), 900);
}
function flashHit(unitEl)
{
  unitEl.classList.add("hitflash","shake");
  setTimeout(()=>unitEl.classList.remove("hitflash","shake"), 360);
}

// 한 라운드 애니메이션 실행
async function animateRound(mode)
{
  syncFromInputs();
  const before = { A:{...state.A}, B:{...state.B} };
  const { A: nA, B: nB, outcome } = runRound(before.A, before.B, mode);

  if (mode === "simul"){
    // 동시 피해
    flashHit(unitA); flashHit(unitB);
    floater(A_floaters, `-${before.B.pw.toLocaleString("ko-KR")}`);
    floater(B_floaters, `-${before.A.pw.toLocaleString("ko-KR")}`);
    state.A.lf = nA.lf; state.B.lf = nB.lf; render();
    await wait(550);
  } else {
    // A 선공 → B 생존 시 반격
    flashHit(unitB);
    floater(B_floaters, `-${before.A.pw.toLocaleString("ko-KR")}`);
    state.B.lf = nB.lf; render();
    await wait(450);
    if (nB.lf > 0){
      flashHit(unitA);
      floater(A_floaters, `-${before.B.pw.toLocaleString("ko-KR")}`);
      state.A.lf = nA.lf; render();
      await wait(450);
    } else {
      state.A.lf = nA.lf; render();
    }
  }

  updateStatus(outcome);
  logLine(log, `라운드 결과: ${outcome} | A LF=${Math.max(0,state.A.lf)} / B LF=${Math.max(0,state.B.lf)}`);
  return outcome;
}

function updateStatus(outcome)
{
  statusEl.className = "status";
  if (outcome === "A_WIN"){ statusEl.classList.add("win"); statusEl.textContent="A 승리"; }
  else if (outcome === "B_WIN"){ statusEl.classList.add("lose"); statusEl.textContent="B 승리"; }
  else if (outcome === "DRAW"){ statusEl.classList.add("draw"); statusEl.textContent="무승부(동시 소멸)"; }
  else { statusEl.textContent="양측 생존 (다음 라운드)"; }
}

function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }
function disableButtons(dis){ [btnRound,btnAuto,btnReset].forEach(b=>b.disabled=dis); }

// 버튼
btnRound.addEventListener("click", async ()=>{
  disableButtons(true);
  await animateRound(rulesetSelect.value);
  disableButtons(false);
});
btnAuto.addEventListener("click", async ()=>{
  disableButtons(true);
  for (let i=0; i<300; ++i){
    const out = await animateRound(rulesetSelect.value);
    if (out !== "CONTINUE") break;
  }
  disableButtons(false);
});
btnReset.addEventListener("click", ()=>{
  state = {
    A: { id:"A_default", name:"공격자 A", pw:4000, lf:6000, maxLF:6000, image:"assets/img/cardA.png" },
    B: { id:"B_default", name:"방어자 B", pw:3000, lf:4000, maxLF:4000, image:"assets/img/cardB.png" }
  };
  a_pw.value = state.A.pw; a_lf.value = state.A.lf;
  b_pw.value = state.B.pw; b_lf.value = state.B.lf;
  imgA.src = state.A.image; imgB.src = state.B.image;
  resetLog(log);
  statusEl.className = "status"; statusEl.textContent = "대기 중";
  render();
});

// 초기 표시
a_pw.value = state.A.pw; a_lf.value = state.A.lf;
b_pw.value = state.B.pw; b_lf.value = state.B.lf;
imgA.src = state.A.image; imgB.src = state.B.image;
render();
console.log("[Brawl] selection + visual simulator ready");
