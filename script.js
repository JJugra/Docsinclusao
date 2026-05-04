// 1. Inicialização

const MAPA_SEMANAS_2026 = {
  "09/02 a 13/02": "1ª semana",
  "16/02 a 20/02": "2ª semana",
  "23/02 a 27/02": "3ª semana",
  "02/03 a 06/03": "4ª semana",
  "09/03 a 13/03": "5ª semana",
  "16/03 a 20/03": "6ª semana",
  "23/03 a 27/03": "7ª semana",
  "30/03 a 03/04": "8ª semana",
  "06/04 a 10/04": "9ª semana",
  "13/04 a 17/04": "10ª semana",
  "20/04 a 24/04": "11ª semana",
  "27/04 a 01/05": "12ª semana",
  "04/05 a 08/05": "13ª semana",
  "11/05 a 15/05": "14ª semana",
  "18/05 a 22/05": "15ª semana",
  "25/05 a 29/05": "16ª semana",
  "01/06 a 05/06": "17ª semana",
  "08/06 a 12/06": "18ª semana",
  "15/06 a 19/06": "19ª semana",
  "22/06 a 26/06": "20ª semana",
  "29/06 a 03/07": "21ª semana",
  "06/07 a 10/07": "22ª semana",
  "13/07 a 17/07": "23ª semana",
  "20/07 a 24/07": "24ª semana",
  "27/07 a 31/07": "25ª semana",
  "03/08 a 07/08": "26ª semana",
  "10/08 a 14/08": "27ª semana",
  "17/08 a 21/08": "28ª semana",
  "24/08 a 28/08": "29ª semana",
  "31/08 a 04/09": "30ª semana",
  "07/09 a 11/09": "31ª semana",
  "14/09 a 18/09": "32ª semana",
  "21/09 a 25/09": "33ª semana",
  "28/09 a 02/10": "34ª semana",
  "05/10 a 09/10": "35ª semana",
  "12/10 a 16/10": "36ª semana",
  "19/10 a 23/10": "37ª semana",
  "26/10 a 30/10": "38ª semana",
  "02/11 a 06/11": "39ª semana",
  "09/11 a 13/11": "40ª semana",
  "16/11 a 20/11": "41ª semana",
  "23/11 a 27/11": "42ª semana",
  "30/11 a 04/12": "43ª semana",
  "07/12 a 11/12": "44ª semana",
  "14/12 a 18/12": "45ª semana",
  "21/12 a 25/12": "46ª semana",
  "28/12 a 01/01": "47ª semana",
};

// 2. Função para SALVAR
// No topo do arquivo script.js, garanta que esta variável existe:

async function enviarParaSupabase() {
  if (!supabaseClient) {
    alert("Erro: Cliente Supabase não configurado.");
    return;
  }

  try {
    // 1. Captura o Professor Logado
    const cache = localStorage.getItem("usuarioAtivo");
    if (!cache) {
      alert("Sessão expirada! Por favor, faça login novamente.");
      window.location.href = "login.html";
      return;
    }
    const usuarioLogado = JSON.parse(cache);
    const nomeProfessor = usuarioLogado.nome;

    // 2. Captura Período e Aluno
    const d1 = document.getElementById("date-1")?.innerText.trim() || "";
    const d2 = document.getElementById("date-2")?.innerText.trim() || "";
    const d3 = document.getElementById("date-3")?.innerText.trim() || "";
    const d4 = document.getElementById("date-4")?.innerText.trim() || "";
    const periodoDigitado = `${d1}/${d2} a ${d3}/${d4}`;
    const alunoNome =
      document.getElementById("field-aluno")?.innerText.trim() || "Sem Nome";
    const semanaIdentificada =
      MAPA_SEMANAS_2026[periodoDigitado] || "Semana Extra";

    // 3. VERIFICAÇÃO TRIPLA (Somente se não houver um semanário já aberto para edição)
    if (!idSemanarioAberto) {
      const { data: existente, error: errVerif } = await supabaseClient
        .from("semanarios")
        .select("id")
        .eq("professor_adj", nomeProfessor)
        .eq("semana_periodo", periodoDigitado)
        .eq("aluno", alunoNome)
        .maybeSingle();

      if (errVerif) throw errVerif;

      if (existente) {
        const desejaAtualizar = confirm(
          `Você já possui um registro para o aluno ${alunoNome} na ${semanaIdentificada}.\n\nDeseja ATUALIZAR os dados existentes?`,
        );
        if (desejaAtualizar) {
          idSemanarioAberto = existente.id;
        } else {
          return;
        }
      } else {
        const confirmaNova = confirm(
          `Nenhum registro encontrado para ${alunoNome} nesta semana.\n\nDeseja INSERIR um novo registro?`,
        );
        if (!confirmaNova) return;
      }
    }

    // 4. PREPARA O OBJETO PARA SALVAR (Com todas as colunas)
    const registroCompleto = {
      aluno: alunoNome,
      unidade_escolar:
        document.getElementById("field-unidade")?.innerText || "",
      professor_adj:
        document.getElementById("field-prof-adj")?.innerText || nomeProfessor,
      professor_regente: document.getElementById("field-prof")?.innerText || "",
      turma: document.getElementById("field-turma")?.innerText || "",
      ano_letivo: document.getElementById("field-ano")?.innerText || "",
      semana_periodo: periodoDigitado,
      classificacao_semana: semanaIdentificada,
    };

    // --- LOOP DAS CÉLULAS (cell1 até cell15) ---
    for (let i = 1; i <= 15; i++) {
      const celulaHTML = document.getElementById(`cell-${i}`);
      registroCompleto[`cell${i}`] = celulaHTML
        ? celulaHTML.innerText.trim()
        : "";
    }

    // Se for atualização, inclui o ID existente
    if (idSemanarioAberto) {
      registroCompleto.id = idSemanarioAberto;
    }

    // 5. ENVIO FINAL PARA O SUPABASE
    const { error: errSalvar } = await supabaseClient
      .from("semanarios")
      .upsert([registroCompleto]);

    if (errSalvar) throw errSalvar;

    alert("✅ Dados salvos com sucesso!");

    // 6. LIMPEZA E ATUALIZAÇÃO
    idSemanarioAberto = null;
    if (typeof carregarSemanarios === "function") {
      carregarSemanarios();
    }
  } catch (error) {
    console.error("Erro completo:", error);
    alert("Erro ao salvar: " + error.message);
  }
} // <--- ESTA CHAVE FECHA A FUNÇÃO E DEVE SER A ÚLTIMA.
// 3. Função para CARREGAR A LISTA (O histórico)
async function carregarSemanarios() {
  try {
    // --- PARTE ADICIONADA PARA FILTRO ---
    const cache = localStorage.getItem("usuarioAtivo");
    if (!cache) return;
    const usuarioLogado = JSON.parse(cache);
    const nomeProfessor = usuarioLogado.nome;
    // ------------------------------------

    const { data, error } = await supabaseClient
      .from("semanarios")
      .select("*")
      .eq("professor_adj", nomeProfessor) // Filtra pelo professor logado
      .order("data_criacao", { ascending: false });

    if (error) throw error;
    exibirLista(data);
  } catch (error) {
    console.error("Erro ao carregar lista:", error.message);
  }
}

// 4. Função para MOSTRAR A LISTA NO HTML
function exibirLista(semanarios) {
  const lista = document.getElementById("lista-alunos");
  if (!lista) return;
  lista.innerHTML = "";

  // 1. ORDENAÇÃO: Garante a ordem matemática (1, 2, 3...) baseada no nome da semana
  semanarios.sort((a, b) => {
    const nomeA = MAPA_SEMANAS_2026[a.semana_periodo] || "";
    const nomeB = MAPA_SEMANAS_2026[b.semana_periodo] || "";
    const numA = parseInt(nomeA) || 999;
    const numB = parseInt(nomeB) || 999;
    return numA - numB;
  });

  semanarios.forEach((item) => {
    const li = document.createElement("li");
    li.style =
      "padding:12px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;";

    const dataHoraF = new Date(item.data_criacao).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const semanaNome = MAPA_SEMANAS_2026[item.semana_periodo] || "Semana Extra";

    // 2. MONTAGEM DO HTML: Sem o ID, focando na Semana e no Aluno
    li.innerHTML = `
        <span style="line-height: 1.5;">
            <strong style="color: #d9534f; font-size: 1.1em;">${semanaNome}</strong> 
            <span style="color: #333; font-weight: 600; margin-left: 8px;">- ${item.aluno}</span>
            <br>
            <small style="color: #777;">🗓️ ${item.semana_periodo} | 🕒 Salvo em: ${dataHoraF}</small>
        </span>
        <button onclick="abrirSemanario('${item.id}')" style="cursor:pointer; padding:8px 16px; background:#007bff; color:white; border:none; border-radius:6px; font-weight:bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Visualizar
        </button>
    `;
    lista.appendChild(li);
    li.innerHTML = `
    <span style="line-height: 1.5;">
        <strong style="color: #d9534f; font-size: 1.1em;">${semanaNome}</strong> 
        <span style="color: #333; font-weight: 600; margin-left: 8px;">- ${item.aluno}</span>
        <br>
        <small style="color: #777;">🗓️ ${item.semana_periodo} | 🕒 Salvo em: ${dataHoraF}</small>
    </span>
    <div style="display: flex; gap: 8px;">
        <button onclick="abrirSemanario('${item.id}')" style="cursor:pointer; padding:8px 12px; background:#007bff; color:white; border:none; border-radius:6px; font-weight:bold;">
            Visualizar
        </button>
        
        <button onclick="excluirSemanario('${item.id}', '${semanaNome}')" style="cursor:pointer; padding:8px 12px; background:#dc3545; color:white; border:none; border-radius:6px; font-weight:bold;" title="Excluir">
            🗑️
        </button>
    </div>
`;
  });
}
async function excluirSemanario(id, semanaNome) {
  const confirmar = confirm(
    `Tem certeza que deseja excluir o semanário da ${semanaNome}? Esta ação não pode ser desfeita.`,
  );

  if (!confirmar) return;

  try {
    const { error } = await supabaseClient
      .from("semanarios")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("Semanário excluído com sucesso!");

    // Se o semanário que você excluiu era o que estava aberto na tela, limpe o formulário
    if (idSemanarioAberto === id) {
      novoSemanario(); // Função que você já deve ter para limpar os campos
    }

    // Atualiza a lista lateral automaticamente
    carregarSemanarios();
  } catch (error) {
    alert("Erro ao excluir: " + error.message);
  }
}
// 5. Função para VOLTAR OS DADOS PARA A TABELA
// Função principal para carregar os dados do banco para a tela
async function abrirSemanario(id) {
  try {
    console.log("Tentando abrir o ID:", id);

    const { data: item, error } = await supabaseClient
      .from("semanarios")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!item) {
      alert("Semanário não encontrado!");
      return;
    }

    // Define o ID global para que o botão 'Salvar' saiba que é ATUALIZAÇÃO
    idSemanarioAberto = item.id;

    // Preenche o Cabeçalho (com verificação para não quebrar)
    const setField = (id, valor) => {
      const el = document.getElementById(id);
      if (el) el.innerText = valor || "";
    };

    setField("field-aluno", item.aluno);
    setField("field-unidade", item.unidade_escolar);
    setField("field-prof-adj", item.professor_adj);
    setField("field-prof", item.professor_regente);
    setField("field-turma", item.turma);
    setField("field-ano", item.ano_letivo);

    // Preenche as Datas
    if (item.semana_periodo) {
      const partes = item.semana_periodo.split(/[\/\s a]+/);
      if (partes.length >= 4) {
        setField("date-1", partes[0]);
        setField("date-2", partes[1]);
        setField("date-3", partes[2]);
        setField("date-4", partes[3]);
      }
    }

    // Preenche as 15 Células (Colunas Individuais)
    for (let i = 1; i <= 15; i++) {
      const celula = document.getElementById(`cell-${i}`);
      if (celula) {
        celula.innerText = item[`cell${i}`] || "";
      }
    }

    alert("Semanário carregado!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Erro crítico ao abrir:", err);
    alert("Erro ao carregar: " + err.message);
  }
}

// 5. Função para VOLTAR OS DADOS PARA A TABELA

// --- FUNÇÕES AUXILIARES ---

function capturarLinha(seletor) {
  const celulas = document.querySelectorAll(seletor);
  const dias = ["segunda", "terca", "quarta", "quinta", "sexta"];
  let obj = {};
  celulas.forEach((c, i) => {
    if (dias[i]) obj[dias[i]] = c.innerText.trim();
  });
  return obj;
}

function preencherLinha(seletor, dados) {
  if (!dados) return;
  const celulas = document.querySelectorAll(seletor);
  const dias = ["segunda", "terca", "quarta", "quinta", "sexta"];
  celulas.forEach((c, i) => {
    c.innerText = dados[dias[i]] || "";
  });
}
function novoSemanario() {
  idSemanarioAberto = null; // Reseta o ID

  // Limpa todos os campos editáveis (IDs fixos e células)
  const campos = [
    "field-aluno",
    "field-unidade",
    "field-prof-adj",
    "field-prof",
    "field-turma",
    "field-ano",
    "date-1",
    "date-2",
    "date-3",
    "date-4",
  ];
  campos.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = "";
  });

  for (let i = 1; i <= 15; i++) {
    const celula = document.getElementById(`cell-${i}`);
    if (celula) celula.innerText = "";
  }

  alert("Formulário limpo para novo registro.");
}
function exibirLista(semanarios) {
  const listaContainer = document.getElementById("lista-alunos");
  if (!listaContainer) return;
  listaContainer.innerHTML = "";

  const nomesMeses = {
    "01": "Janeiro",
    "02": "Fevereiro",
    "03": "Março",
    "04": "Abril",
    "05": "Maio",
    "06": "Junho",
    "07": "Julho",
    "08": "Agosto",
    "09": "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro",
  };

  // 1. Agrupar semanários por Mês
  const gruposPorMes = {};

  semanarios.forEach((item) => {
    const partes = item.semana_periodo.split(/[\/\s]+/);
    const mesInicio = partes[1];
    const mesFim = partes[4];

    const mesAlvo = mesInicio === mesFim ? mesInicio : mesFim;
    const nomeMes = nomesMeses[mesAlvo] || "Outros";

    if (!gruposPorMes[nomeMes]) gruposPorMes[nomeMes] = [];
    gruposPorMes[nomeMes].push(item);
  });

  // 2. Ordenar os meses cronologicamente (Fevereiro -> Março...)
  const mesesOrdenados = Object.keys(gruposPorMes).sort((a, b) => {
    const ordem = Object.values(nomesMeses);
    return ordem.indexOf(a) - ordem.indexOf(b);
  });

  // 3. Renderizar cada Mês e seus itens ordenados
  mesesOrdenados.forEach((mes) => {
    const btnMes = document.createElement("button");
    btnMes.className = "mes-header";
    btnMes.innerHTML = `<span>📅 ${mes.toUpperCase()}</span> <span>▼</span>`;

    const divConteudo = document.createElement("div");
    divConteudo.className = "mes-conteudo";

    const ulMes = document.createElement("ul");
    ulMes.style.listStyle = "none";
    ulMes.style.padding = "0";

    // --- LÓGICA DE ORDENAÇÃO INTERNA (MENOR PARA MAIOR) ---
    // Ordenamos os itens do mês baseados no MAPA_SEMANAS_2026
    gruposPorMes[mes].sort((a, b) => {
      const nomeA = MAPA_SEMANAS_2026[a.semana_periodo] || "";
      const nomeB = MAPA_SEMANAS_2026[b.semana_periodo] || "";

      // Extrai apenas o número (ex: "1ª Semana" vira 1)
      const numA = parseInt(nomeA) || 99;
      const numB = parseInt(nomeB) || 99;

      return numA - numB; // Ordem crescente (1, 2, 3...)
    });

    gruposPorMes[mes].forEach((item) => {
      const li = document.createElement("li");
      li.style =
        "padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; font-size:13px;";

      const semanaNome =
        MAPA_SEMANAS_2026[item.semana_periodo] || "Semana Extra";

      li.innerHTML = `
        <span>
            <strong>${semanaNome}</strong> <br>
            <small style="color:#666">${item.semana_periodo} - ${item.aluno}</small>
        </span>
        <div style="display:flex; gap:5px;">
          <button onclick="abrirSemanario('${item.id}')" title="Visualizar" style="cursor:pointer; padding:6px; background:#007bff; color:white; border:none; border-radius:3px;">👁️</button>
          <button onclick="excluirSemanario('${item.id}', '${semanaNome}')" title="Excluir" style="cursor:pointer; padding:6px; background:#dc3545; color:white; border:none; border-radius:3px;">🗑️</button>
        </div>
      `;
      ulMes.appendChild(li);
    });

    divConteudo.appendChild(ulMes);

    // Comportamento do Accordion
    btnMes.onclick = function () {
      const estaAberto = divConteudo.style.display === "block";
      divConteudo.style.display = estaAberto ? "none" : "block";
      this.querySelector("span:last-child").innerText = estaAberto ? "▼" : "▲";
    };

    listaContainer.appendChild(btnMes);
    listaContainer.appendChild(divConteudo);
  });
}
// Executa assim que a página abre
carregarSemanarios();
