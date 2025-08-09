// /js/main.js
import { createCard } from "./card.js";
import { runRound, runUntilEnd } from "./simulator.js";
import { logLine, resetLog } from "./utils.js";

// DOM 참조
const $ = (s) => document.querySelector(s);
const a_pw = $("#a_pw"),
  a_lf = $("#a_lf");
const b_pw = $("#b_pw"),
  b_lf = $("#b_lf");
const rulesetSelect = $("#rulesetSelect");
const clampZero = $("#clampZero");
const btnRound = $("#btnRound"),
  btnAuto = $("#btnAuto"),
  btnReset = $("#btnReset");
const log = $("#log"),
  statusEl = $("#status");

const unitA = $("#unitA"),
  unitB = $("#unitB");
const A_pw_val = $("#A_pw_val"),
  B_pw_val = $("#B_pw_val");
const A_hp_fill = $("#A_hp_fill"),
  B_hp_fill = $("#B_hp_fill");
const A_hp_text = $("#A_hp_text"),
  B_hp_text = $("#B_hp_text");
const A_floaters = $("#A_floaters"),
  B_floaters = $("#B_floaters");

// 상태 (maxLF는 HP바 비율 계산용)
let state = {
  A: { pw: 4000, lf: 6000, maxLF: 6000 },
  B: { pw: 3000, lf: 4000, maxLF: 4000 },
};

function syncFromInputs() {
  state.A.pw = Math.max(0, Number(a_pw.value) || 0);
  state.A.lf = Math.max(0, Number(a_lf.value) || 0);
  state.A.maxLF = Math.max(state.A.maxLF, state.A.lf);
  state.B.pw = Math.max(0, Number(b_pw.value) || 0);
  state.B.lf = Math.max(0, Number(b_lf.value) || 0);
  state.B.maxLF = Math.max(state.B.maxLF, state.B.lf);
  render();
}

function render() {
  // 숫자 업데이트
  A_pw_val.textContent = state.A.pw.toLocaleString("ko-KR");
  B_pw_val.textContent = state.B.pw.toLocaleString("ko-KR");

  // HP 표시
  const aLF = clampZero.checked ? Math.max(0, state.A.lf) : state.A.lf;
  const bLF = clampZero.checked ? Math.max(0, state.B.lf) : state.B.lf;
  const aPct = Math.max(0, Math.min(100, (aLF / state.A.maxLF) * 100 || 0));
  const bPct = Math.max(0, Math.min(100, (bLF / state.B.maxLF) * 100 || 0));
  A_hp_fill.style.width = aPct + "%";
  B_hp_fill.style.width = bPct + "%";
  A_hp_text.textContent = `LF ${aLF.toLocaleString(
    "ko-KR"
  )} / ${state.A.maxLF.toLocaleString("ko-KR")}`;
  B_hp_text.textContent = `LF ${bLF.toLocaleString(
    "ko-KR"
  )} / ${state.B.maxLF.toLocaleString("ko-KR")}`;

  // 사망 비주얼
  unitA.classList.toggle("dead", aLF <= 0);
  unitB.classList.toggle("dead", bLF <= 0);
}

function floater(targetEl, text, cls = "hit") {
  const f = document.createElement("div");
  f.className = `floater ${cls}`;
  f.textContent = text;
  targetEl.appendChild(f);
  setTimeout(() => f.remove(), 900);
}

function flashHit(unitEl) {
  unitEl.classList.add("hitflash", "shake");
  setTimeout(() => unitEl.classList.remove("hitflash", "shake"), 360);
}

// 한 라운드를 “보여주며” 적용
async function animateRound(mode) {
  // 입력 동기화
  syncFromInputs();

  // 계산만 먼저
  const before = { A: { ...state.A }, B: { ...state.B } };
  const { A: nA, B: nB, outcome } = runRound(before.A, before.B, mode);

  // 애니메이션: 모드별 연출 순서
  if (mode === "simul") {
    // 서로 동시 타격 (시각적으로 거의 동시)
    flashHit(unitA);
    flashHit(unitB);
    floater(A_floaters, `-${before.B.pw.toLocaleString("ko-KR")}`);
    floater(B_floaters, `-${before.A.pw.toLocaleString("ko-KR")}`);
    // 수치 반영
    state.A.lf = nA.lf;
    state.B.lf = nB.lf;
    render();
    await wait(550);
  } // first (A 선공 → B 생존 시 반격)
  else {
    // A → B
    flashHit(unitB);
    floater(B_floaters, `-${before.A.pw.toLocaleString("ko-KR")}`);
    state.B.lf = nB.lf;
    render();
    await wait(450);

    // B 생존 시 반격
    if (nB.lf > 0) {
      flashHit(unitA);
      floater(A_floaters, `-${before.B.pw.toLocaleString("ko-KR")}`);
      state.A.lf = nA.lf;
      render();
      await wait(450);
    } else {
      state.A.lf = nA.lf; // (변동 없을 수 있으나 안전 반영)
      render();
    }
  }

  // 상태/로그/판정
  statusByOutcome(outcome);
  logLine(
    log,
    `라운드 결과: ${outcome} | A LF=${
      clampZero.checked ? Math.max(0, state.A.lf) : state.A.lf
    }, B LF=${clampZero.checked ? Math.max(0, state.B.lf) : state.B.lf}`
  );
  return outcome;
}

function statusByOutcome(outcome) {
  statusEl.className = "status";
  if (outcome === "A_WIN") {
    statusEl.classList.add("win");
    statusEl.textContent = "A 승리";
  } else if (outcome === "B_WIN") {
    statusEl.classList.add("lose");
    statusEl.textContent = "B 승리";
  } else if (outcome === "DRAW") {
    statusEl.classList.add("draw");
    statusEl.textContent = "무승부(동시 소멸)";
  } else {
    statusEl.textContent = "양측 생존 (다음 라운드)";
  }
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

btnRound.addEventListener("click", async () => {
  disableButtons(true);
  await animateRound(rulesetSelect.value);
  disableButtons(false);
});

btnAuto.addEventListener("click", async () => {
  disableButtons(true);
  // 결판까지 반복(시각 템포)
  for (let i = 0; i < 300; ++i) {
    const out = await animateRound(rulesetSelect.value);
    const done = out !== "CONTINUE";
    if (done) break;
  }
  disableButtons(false);
});

btnReset.addEventListener("click", () => {
  a_pw.value = 4000;
  a_lf.value = 6000;
  b_pw.value = 3000;
  b_lf.value = 4000;
  state = {
    A: { pw: 4000, lf: 6000, maxLF: 6000 },
    B: { pw: 3000, lf: 4000, maxLF: 4000 },
  };
  resetLog(log);
  statusEl.className = "status";
  statusEl.textContent = "대기 중";
  render();
});

[a_pw, a_lf, b_pw, b_lf].forEach((el) =>
  el.addEventListener("change", syncFromInputs)
);
render();
function disableButtons(dis) {
  [btnRound, btnAuto, btnReset].forEach((b) => (b.disabled = dis));
}
console.log("[Brawl] visual simulator ready");
