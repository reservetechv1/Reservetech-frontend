const token = localStorage.getItem("token");
const listaEquipamentosForm = document.querySelector(
  "#lista-equipamentos-form",
);
const btnAdicionarEquipamento = document.querySelector(
  "#btn-adicionar-equipamento",
);
const form = document.querySelector("#form-equipamento");
const mensagemErro = document.querySelector("#erro-equipamento");

function criarLinhaEquipamento() {
  const linha = document.createElement("div");
  linha.className = "linha-multipla";

  const campoNome = document.createElement("div");
  campoNome.className = "coleta-dados";
  campoNome.innerHTML = "<label>Nome</label>";
  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.className = "input-nome-equip";
  inputNome.placeholder = "Ex: Projetor Epson";
  inputNome.required = true;
  campoNome.appendChild(inputNome);

  const campoDescricao = document.createElement("div");
  campoDescricao.className = "coleta-dados";
  campoDescricao.innerHTML = "<label>Descrição</label>";
  const inputDescricao = document.createElement("input");
  inputDescricao.type = "text";
  inputDescricao.className = "input-descricao-equip";
  inputDescricao.placeholder = "Ex: Projetor portátil HD";
  campoDescricao.appendChild(inputDescricao);

  const campoQuantidade = document.createElement("div");
  campoQuantidade.className = "coleta-dados";
  campoQuantidade.innerHTML = "<label>Quantidade</label>";
  const inputQuantidade = document.createElement("input");
  inputQuantidade.type = "number";
  inputQuantidade.className = "input-quantidade-equip";
  inputQuantidade.min = "0";
  inputQuantidade.value = "1";
  inputQuantidade.required = true;
  campoQuantidade.appendChild(inputQuantidade);

  const campoStatus = document.createElement("div");
  campoStatus.className = "coleta-dados";
  campoStatus.innerHTML = "<label>Status</label>";
  const selectStatus = document.createElement("select");
  selectStatus.className = "select-status-equip";
  selectStatus.innerHTML =
    '<option value="DISPONIVEL">Disponível</option>' +
    '<option value="EM_USO">Em uso</option>' +
    '<option value="EM_MANUTENCAO">Em manutenção</option>';
  campoStatus.appendChild(selectStatus);

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.className = "btn-remover-item";
  btnRemover.textContent = "×";
  btnRemover.addEventListener("click", function () {
    if (listaEquipamentosForm.children.length > 1) {
      linha.remove();
    } else {
      alert("Mantenha ao menos um equipamento no formulário.");
    }
  });

  linha.appendChild(campoNome);
  linha.appendChild(campoDescricao);
  linha.appendChild(campoQuantidade);
  linha.appendChild(campoStatus);
  linha.appendChild(btnRemover);
  listaEquipamentosForm.appendChild(linha);
}

btnAdicionarEquipamento.addEventListener("click", criarLinhaEquipamento);
criarLinhaEquipamento();

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const linhas = Array.from(
    listaEquipamentosForm.querySelectorAll(".linha-multipla"),
  );
  const equipamentos = linhas.map(function (linha) {
    return {
      nome: linha.querySelector(".input-nome-equip").value,
      descricao: linha.querySelector(".input-descricao-equip").value,
      quantidadeDisponivel: Number(
        linha.querySelector(".input-quantidade-equip").value,
      ),
      status: linha.querySelector(".select-status-equip").value,
    };
  });

  const requisicoes = equipamentos.map(function (equipamento) {
    return fetch(API + "/dispositivos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(equipamento),
    }).then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem || "Erro ao cadastrar equipamento.");
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
      alert(sucesso + " equipamento(s) cadastrado(s) com sucesso!");
      window.location.href = "painel-ti.html";
    } else {
      mensagemErro.textContent =
        sucesso +
        " equipamento(s) cadastrado(s) com sucesso. " +
        falhas +
        " com erro — corrija abaixo e salve novamente.";
      if (listaEquipamentosForm.children.length === 0) {
        criarLinhaEquipamento();
      }
    }
  });
});
