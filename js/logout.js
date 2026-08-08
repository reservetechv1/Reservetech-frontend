const DURACAO_SESSAO_MS = 30 * 60 * 1000;
const LIMITE_INATIVIDADE_MS = 15 * 60 * 1000;

let intervalTimer = null;

function logout(mensagem) {
  localStorage.removeItem("token");
  localStorage.removeItem("loginTimestamp");
  localStorage.removeItem("ultimaAtividade");

  if (mensagem) {
    sessionStorage.setItem("mensagemLogin", mensagem);
  }

  window.location.href = "login.html";
}

function exigirAutenticacao() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  if (!localStorage.getItem("loginTimestamp")) {
    localStorage.setItem("loginTimestamp", Date.now().toString());
  }

  registrarAtividade();
}

function registrarAtividade() {
  localStorage.setItem("ultimaAtividade", Date.now().toString());
}

function calcularTempoRestante() {
  const agora = Date.now();
  const loginEm = Number(localStorage.getItem("loginTimestamp"));
  const ultimaAtividade = Number(localStorage.getItem("ultimaAtividade"));

  const tempoRestanteSessao = DURACAO_SESSAO_MS - (agora - loginEm);
  const tempoRestanteInatividade =
    LIMITE_INATIVIDADE_MS - (agora - ultimaAtividade);

  return Math.min(tempoRestanteSessao, tempoRestanteInatividade);
}

function formatarTempo(ms) {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return (
    String(minutos).padStart(2, "0") + ":" + String(segundos).padStart(2, "0")
  );
}

function iniciarMonitoramentoSessao() {
  const displayTimer = document.querySelector("#timer-sessao");

  intervalTimer = setInterval(function () {
    const agora = Date.now();
    const loginEm = Number(localStorage.getItem("loginTimestamp"));
    const ultimaAtividade = Number(localStorage.getItem("ultimaAtividade"));

    const tempoRestanteSessao = DURACAO_SESSAO_MS - (agora - loginEm);
    const tempoInativo = agora - ultimaAtividade;

    if (displayTimer) {
      displayTimer.textContent =
        "Tempo de sessão: " + formatarTempo(tempoRestanteSessao);
    }

    if (tempoInativo >= LIMITE_INATIVIDADE_MS) {
      clearInterval(intervalTimer);
      logout("Você foi desconectado por inatividade.");
      return;
    }

    if (tempoRestanteSessao <= 0) {
      clearInterval(intervalTimer);
      logout("Sua sessão expirou. Por favor, faça login novamente.");
      return;
    }
  }, 1000);

  ["click", "keydown", "mousemove", "scroll"].forEach(function (evento) {
    document.addEventListener(evento, registrarAtividade, { passive: true });
  });
}

function exibirMensagemPendente() {
  const mensagem = sessionStorage.getItem("mensagemLogin");
  if (mensagem) {
    sessionStorage.removeItem("mensagemLogin");
    const container = document.querySelector("#mensagem-sessao");
    if (container) {
      container.textContent = mensagem;
      container.style.display = "block";
    } else {
      alert(mensagem);
    }
  }
}

exigirAutenticacao();

document.addEventListener("DOMContentLoaded", function () {
  const btnLogout = document.querySelector("#btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      logout(null);
    });
  }

  if (localStorage.getItem("token")) {
    iniciarMonitoramentoSessao();
  }

  exibirMensagemPendente();
});
