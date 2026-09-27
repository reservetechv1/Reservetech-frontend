const token = localStorage.getItem("token");
const perfil = localStorage.getItem("perfil");

const linkVoltar = document.querySelector("#link-voltar-trocar-senha");
linkVoltar.href = perfil === "TI" ? "painel-ti.html" : "reservas.html";

const form = document.querySelector("#form-trocar-senha");
const mensagemErro = document.querySelector("#erro-trocar-senha");

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const senhaAtual = document.querySelector("#senha-atual").value;
  const novaSenha = document.querySelector("#nova-senha").value;
  const confirmarSenha = document.querySelector("#confirmar-senha").value;

  if (novaSenha !== confirmarSenha) {
    mensagemErro.textContent = "A nova senha e a confirmação não coincidem.";
    return;
  }

  fetch(API + "/usuarios/me/senha", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ senhaAtual: senhaAtual, novaSenha: novaSenha }),
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem || "Erro ao trocar a senha.");
        });
      }
      alert("Senha alterada com sucesso!");
      window.location.href = linkVoltar.href;
    })
    .catch(function (erro) {
      mensagemErro.textContent = erro.message;
    });
});
