const token = localStorage.getItem("token");
const form = document.querySelector("#form-sala");
const mensagemErro = document.querySelector("#erro-sala");

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const dadosSala = {
    nome: document.querySelector("#nome").value,
    andar: document.querySelector("#andar").value,
  };

  fetch(API + "/salas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dadosSala),
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
      alert("Sala cadastrada com sucesso!");
      window.location.href = "painel-ti.html";
    })
    .catch(function (erro) {
      mensagemErro.textContent = erro.message;
    });
});
