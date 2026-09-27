const token = localStorage.getItem("token");
const listaBackups = document.querySelector("#lista-backups");
const btnGerarBackup = document.querySelector("#btn-gerar-backup");

function formatarData(dataIso) {
  const data = new Date(dataIso);
  return data.toLocaleString("pt-BR");
}

function formatarTamanho(bytes) {
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(1) + " KB";
}

function carregarBackups() {
  fetch(API + "/backups", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (backups) {
      listaBackups.innerHTML = "";

      if (backups.length === 0) {
        listaBackups.innerHTML = "<p>Nenhum backup gerado ainda.</p>";
        return;
      }

      backups.forEach(function (backup) {
        const card = document.createElement("div");
        card.className = "card-reserva";
        card.innerHTML =
          "<strong>" +
          formatarData(backup.dataCriacao) +
          "</strong><br>Tamanho: " +
          formatarTamanho(backup.tamanhoBytes);

        const btnBaixar = document.createElement("button");
        btnBaixar.textContent = "Baixar";
        btnBaixar.className = "btn-editar";
        btnBaixar.style.width = "auto";
        btnBaixar.style.padding = "6px 12px";
        btnBaixar.style.marginTop = "8px";
        btnBaixar.addEventListener("click", function () {
          baixarBackup(backup.id);
        });

        card.appendChild(document.createElement("br"));
        card.appendChild(btnBaixar);
        listaBackups.appendChild(card);
      });
    });
}

function baixarBackup(id) {
  fetch(API + "/backups/" + id + "/download", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      if (!response.ok) throw new Error("Erro ao baixar o backup.");
      return response.blob();
    })
    .then(function (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "backup-reservetech-" + id + ".json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    .catch(function (erro) {
      alert(erro.message);
    });
}

btnGerarBackup.addEventListener("click", function () {
  btnGerarBackup.disabled = true;
  btnGerarBackup.textContent = "Gerando...";

  fetch(API + "/backups/gerar", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      if (!response.ok) throw new Error("Erro ao gerar backup.");
      carregarBackups();
    })
    .catch(function (erro) {
      alert(erro.message);
    })
    .finally(function () {
      btnGerarBackup.disabled = false;
      btnGerarBackup.textContent = "Gerar backup agora";
    });
});

carregarBackups();
