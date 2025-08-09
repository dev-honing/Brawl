import { fightSimultaneous, fightFirstStrike, checkOutcome } from "./battle.js";

export function runRound(A, B, mode) {
  let result;
  if (mode === "simul") {
    result = fightSimultaneous(A, B);
  } else {
    result = fightFirstStrike(A, B);
  }
  const outcome = checkOutcome(result.A, result.B);
  return { ...result, outcome };
}

export function runUntilEnd(A, B, mode, maxRounds = 100) {
  let rounds = [];
  let currentA = { ...A };
  let currentB = { ...B };
  for (let i = 0; i < maxRounds; i++) {
    const { A: newA, B: newB, outcome } = runRound(currentA, currentB, mode);
    rounds.push({ A: newA, B: newB, outcome });
    currentA = newA;
    currentB = newB;
    if (outcome !== "CONTINUE") break;
  }
  return rounds;
}
