// Gerencia o tema claro/escuro do ReserveTech.
// A preferência fica salva e vale para todas as telas, até a pessoa mudar de novo.
(function () {
  try {
    const salvo = localStorage.getItem("tema");
    if (salvo === "claro") {
      document.documentElement.classList.add("tema-claro");
    }
  } catch (e) {}
})();

function alternarTema() {
  const html = document.documentElement;
  const agoraClaro = html.classList.toggle("tema-claro");
  try {
    localStorage.setItem("tema", agoraClaro ? "claro" : "escuro");
  } catch (e) {}
  atualizarIconeTema();
}

function atualizarIconeTema() {
  const claro = document.documentElement.classList.contains("tema-claro");
  document.querySelectorAll(".btn-tema").forEach(function (btn) {
    btn.textContent = claro ? "\u263D" : "\u2600";
    btn.title = claro ? "Mudar para tema escuro" : "Mudar para tema claro";
  });
}

document.addEventListener("DOMContentLoaded", atualizarIconeTema);
