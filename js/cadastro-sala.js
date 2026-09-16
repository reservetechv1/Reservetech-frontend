const token = localStorage.getItem("token");
const listaSalasForm = document.querySelector("#lista-salas-form");
const btnAdicionarSala = document.querySelector("#btn-adicionar-sala");
const form = document.querySelector("#form-sala");
const mensagemErro = document.querySelector("#erro-sala");

function criarLinhaSala() {
  const linha = document.createElement("div");
  linha.className = "linha-multipla";

  const campoNome = document.createElement("div");
  campoNome.className = "coleta-dados";
  const labelNome = document.createElement("label");
  labelNome.textContent = "Nome da Sala";
  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.className = "input-nome-sala";
  inputNome.placeholder = "Ex: Sala 101";
  inputNome.required = true;
  campoNome.appendChild(labelNome);
  campoNome.appendChild(inputNome);

  const campoAndar = document.createElement("div");
  campoAndar.className = "coleta-dados";
  const labelAndar = document.createElement("label");
  labelAndar.textContent = "Andar";
  const inputAndar = document.createElement("input");
  inputAndar.type = "text";
  inputAndar.className = "input-andar-sala";
  inputAndar.placeholder = "Ex: 1º andar";
  inputAndar.required = true;
  campoAndar.appendChild(labelAndar);
  campoAndar.appendChild(inputAndar);

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.className = "btn-remover-item";
  btnRemover.textContent = "×";
  btnRemover.addEventListener("click", function () {
    if (listaSalasForm.children.length > 1) {
      linha.remove();
    } else {
      alert("Mantenha ao menos uma sala no formulário.");
    }
  });

  linha.appendChild(campoNome);
  linha.appendChild(campoAndar);
  linha.appendChild(btnRemover);
  listaSalasForm.appendChild(linha);
}

btnAdicionarSala.addEventListener("click", criarLinhaSala);
criarLinhaSala();

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const linhas = Array.from(listaSalasForm.querySelectorAll(".linha-multipla"));
  const salas = linhas.map(function (linha) {
    return {
      nome: linha.querySelector(".input-nome-sala").value,
      andar: linha.querySelector(".input-andar-sala").value,
    };
  });

  const requisicoes = salas.map(function (sala) {
    return fetch(API + "/salas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(sala),
    }).then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem || "Erro ao cadastrar sala.");
        });
      }
      return response.json();
    });
  });

  Promise.allSettled(requisicoes).then(function (resultados) {
    let falhas = 0;

    resultados.forEach(function (resultado, i) {
      const linha = linhas[i];
      if (resultado.status === "fulfilled") {
        linha.remove();
      } else {
        falhas++;
        let erroLinha = linha.querySelector(".erro-linha");
        if (!erroLinha) {
          erroLinha = document.createElement("span");
          erroLinha.className = "erro-linha mensagem-erro";
          linha.appendChild(erroLinha);
        }
        erroLinha.textContent = resultado.reason.message;
      }
    });

    const sucesso = resultados.length - falhas;

    if (falhas === 0) {
      alert(sucesso + " sala(s) cadastrada(s) com sucesso!");
      window.location.href = "painel-ti.html";
    } else {
      mensagemErro.textContent =
        sucesso +
        " sala(s) cadastrada(s) com sucesso. " +
        falhas +
        " com erro — corrija abaixo e salve novamente.";
      if (listaSalasForm.children.length === 0) {
        criarLinhaSala();
      }
    }
  });
});
