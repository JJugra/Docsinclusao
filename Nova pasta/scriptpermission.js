// scriptpermission.js

async function verificarSessao() {
  const cache = localStorage.getItem("usuarioAtivo");

  if (!cache) {
    console.warn("Nenhum usuário no cache, redirecionando...");
    window.location.href = "admin.html";
    return;
  }

  const usuario = JSON.parse(cache);
  console.log("Dados do usuário recuperados:", usuario);

  // Pequeno atraso para garantir que o DOM carregou completamente
  setTimeout(() => {
    preencherCamposSemanario(usuario);
  }, 100);
}

function preencherCamposSemanario(u) {
  // Verificando se o ID existe antes de tentar preencher
  const campoAdj = document.getElementById("field-prof-adj");

  if (campoAdj) {
    console.log("Elemento field-prof-adj encontrado! Preenchendo com:", u.nome);
    campoAdj.innerText = u.nome || "Nome não encontrado";
  } else {
    console.error(
      "ERRO: Elemento 'field-prof-adj' não foi encontrado no HTML.",
    );
  }

  // Preencher os outros campos
  const outrosCampos = {
    "field-turma": u.turma,
    "field-telefone": u.telefone,
    "field-ano": u.ano_letivo,
    "field-aluno1": u.aluno1,
    "field-aluno2": u.aluno2,
  };

  for (const [id, valor] of Object.entries(outrosCampos)) {
    const el = document.getElementById(id);
    if (el) el.innerText = valor || "";
  }
}

window.addEventListener("load", verificarSessao);
