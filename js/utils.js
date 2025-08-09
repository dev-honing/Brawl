export function logLine(el, text) {
  el.textContent += text + "\n";
  el.scrollTop = el.scrollHeight;
}

export function resetLog(el) {
  el.textContent = "";
}
