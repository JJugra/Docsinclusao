const TEMPO_INATIVO = 120000; // 1 minuto

let tempoRestante = TEMPO_INATIVO;
let timerInatividade;
let intervaloContador;

function atualizarContador() {
  const segundos = Math.floor(tempoRestante / 1000);
  const min = String(Math.floor(segundos / 60)).padStart(2, "0");
  const seg = String(segundos % 60).padStart(2, "0");

  document.getElementById("tempo-restante").textContent = `${min}:${seg}`;

  tempoRestante -= 1000;
}

function logout() {
  alert("Sessão encerrada por inatividade.");
  localStorage.removeItem("usuarioAtivo");
  window.location.href = "admin.html";
}

function resetarInatividade() {
  clearTimeout(timerInatividade);

  tempoRestante = TEMPO_INATIVO;
  atualizarContador();

  timerInatividade = setTimeout(logout, TEMPO_INATIVO);
}

["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((evt) => {
  document.addEventListener(evt, resetarInatividade);
});

intervaloContador = setInterval(atualizarContador, 1000);

resetarInatividade();
