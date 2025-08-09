export function createCard(pw, lf) {
  return {
    pw: Math.max(0, Number(pw) || 0),
    lf: Math.max(0, Number(lf) || 0),
  };
}
