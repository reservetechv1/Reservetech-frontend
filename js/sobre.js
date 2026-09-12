// Decide para onde o botão "Voltar" do Sobre deve levar.
// Se a pessoa não está logada, mantém o padrão (index.html).
// Se está logada, leva direto para o painel dela (TI ou professor).
(function () {
  const link = document.getElementById("link-voltar-sobre");
  const token = localStorage.getItem("token");
  if (!link || !token) return; // deslogado: mantém o padrão do HTML (index.html)

  function aplicar(perfil) {
    if (perfil === "TI") {
      link.href = "painel-ti.html";
      link.textContent = "Voltar para o Painel TI";
    } else {
      link.href = "reservas.html";
      link.textContent = "Voltar para Minhas Reservas";
    }
  }

  const perfilSalvo = localStorage.getItem("perfil");
  if (perfilSalvo) {
    aplicar(perfilSalvo);
    return;
  }

  fetch(API + "/usuarios/me", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (r) {
      if (!r.ok) throw new Error("sessão inválida");
      return r.json();
    })
    .then(function (usuario) {
      localStorage.setItem("perfil", usuario.perfil);
      aplicar(usuario.perfil);
    })
    .catch(function () {
      // Token inválido/expirado: mantém o padrão (index.html)
    });
})();
