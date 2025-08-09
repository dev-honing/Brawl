// ���� ����(���׶��)
export function fightSimultaneous(A, B) {
  const newA = { ...A, lf: A.lf - B.pw };
  const newB = { ...B, lf: B.lf - A.pw };
  return { A: newA, B: newB };
}

// ����-�ݰ�
export function fightFirstStrike(A, B) {
  let newB = { ...B, lf: B.lf - A.pw };
  let newA = { ...A };
  if (newB.lf > 0) {
    newA = { ...newA, lf: newA.lf - B.pw };
  }
  return { A: newA, B: newB };
}

// �Ҹ� ���� �Ǵ�
export function checkOutcome(A, B) {
  if (A.lf <= 0 && B.lf <= 0) return "DRAW";
  if (A.lf <= 0) return "B_WIN";
  if (B.lf <= 0) return "A_WIN";
  return "CONTINUE";
}
