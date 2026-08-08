const token = localStorage.getItem("token");
const form = document.querySelector("#form-usuario");
const mensagemErro = document.querySelector("#erro-usuario");

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const dadosUsuario = {
    nome: document.querySelector("#nome").value,
    email: document.querySelector("#email").value,
    senha: document.querySelector("#senha").value,
    perfil: document.querySelector("#perfil").value,
  };

  fetch(API + "/auth/registrar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dadosUsuario),
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem);
        });
      }
      return response.json();
    })
    .then(function () {
      alert("Usuário cadastrado com sucesso!");
      window.location.href = "painel-ti.html";
    })
    .catch(function (erro) {
      mensagemErro.textContent = erro.message;
    });
});
