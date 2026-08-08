const token = localStorage.getItem("token");
const form = document.querySelector("#form-equipamento");
const mensagemErro = document.querySelector("#erro-equipamento");

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const dadosEquipamento = {
    nome: document.querySelector("#nome").value,
    descricao: document.querySelector("#descricao").value,
    quantidadeDisponivel: Number(document.querySelector("#quantidade").value),
    status: document.querySelector("#status").value,
  };

  fetch(API + "/dispositivos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dadosEquipamento),
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
      alert("Equipamento cadastrado com sucesso!");
      window.location.href = "painel-ti.html";
    })
    .catch(function (erro) {
      mensagemErro.textContent = erro.message;
    });
});
