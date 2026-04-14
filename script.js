const supabaseUrl = "https://goinbvlnhugizbobdzvc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvaW5idmxuaHVnaXpib2JkenZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODEwMDIsImV4cCI6MjA4OTQ1NzAwMn0.iHd_VGkYWprtPeGeYw2dk-X6T3cFWmh2OolGDA_xZEM";

let supabaseClient;

// 1. Inicialização
try {
  supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  console.log("✅ Supabase configurado com sucesso.");
} catch (e) {
  console.error("❌ Falha na configuração:", e.message);
}

let idSemanarioAberto = null; // Começa vazio
// 2. Função para SALVAR
async function enviarParaSupabase() {
  if (!supabaseClient) return;

  try {
    // 1. Captura as 15 células (sua lógica atual)
    const gradeParaSalvar = {};
    for (let i = 1; i <= 15; i++) {
      gradeParaSalvar[`cell${i}`] =
        document.getElementById(`cell-${i}`)?.innerText.trim() || "";
    }

    // Captura as datas
    gradeParaSalvar.d1 = document.getElementById("date-1")?.innerText || "";
    gradeParaSalvar.d2 = document.getElementById("date-2")?.innerText || "";
    gradeParaSalvar.d3 = document.getElementById("date-3")?.innerText || "";
    gradeParaSalvar.d4 = document.getElementById("date-4")?.innerText || "";

    // 2. Monta o objeto
    const registroCompleto = {
      aluno: document.getElementById("field-aluno")?.innerText || "Sem Nome",
      unidade_escolar:
        document.getElementById("field-unidade")?.innerText || "",
      professor_adj: document.getElementById("field-prof-adj")?.innerText || "",
      professor_regente: document.getElementById("field-prof")?.innerText || "",
      turma: document.getElementById("field-turma")?.innerText || "",
      ano_letivo: document.getElementById("field-ano")?.innerText || "",
      semana_periodo: `${gradeParaSalvar.d1}/${gradeParaSalvar.d2} a ${gradeParaSalvar.d3}/${gradeParaSalvar.d4}`,
      conteudo: gradeParaSalvar,
    };

    // 3. LOGICA DE ATUALIZAÇÃO:
    // Se idSemanarioAberto existir, adicionamos ele ao objeto para o Supabase saber que é um Update
    if (idSemanarioAberto) {
      registroCompleto.id = idSemanarioAberto;
    }

    // O .upsert() insere se não existir ID, ou atualiza se o ID já existir
    const { data, error } = await supabaseClient
      .from("semanarios")
      .upsert([registroCompleto]);

    if (error) throw error;

    alert(
      idSemanarioAberto
        ? "✅ Atualizado com sucesso!"
        : "✅ Salvo com sucesso!",
    );

    // Opcional: Limpar o ID após salvar para permitir um novo
    // idSemanarioAberto = null;

    carregarSemanarios();
  } catch (error) {
    alert("Erro: " + error.message);
  }
}
// 3. Função para CARREGAR A LISTA (O histórico)
async function carregarSemanarios() {
  try {
    const { data, error } = await supabaseClient
      .from("semanarios")
      .select("*")
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

  semanarios.forEach((item) => {
    const li = document.createElement("li");
    li.style =
      "padding:10px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;";
    const dataF = new Date(item.data_criacao).toLocaleDateString("pt-BR");

    li.innerHTML = `
            <span><strong>${item.aluno}</strong> - ${dataF}</span>
            <button onclick="abrirSemanario('${item.id}')" style="cursor:pointer; padding:5px 10px; background:#007bff; color:white; border:none; border-radius:3px;">
                Visualizar
            </button>
        `;
    lista.appendChild(li);
  });
}

// 5. Função para VOLTAR OS DADOS PARA A TABELA
async function abrirSemanario(id) {
  idSemanarioAberto = id; // Guarda o ID para sabermos que estamos editando este
  // ... resto do seu código de carregar os campos

  try {
    const { data, error } = await supabaseClient
      .from("semanarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (data) {
      // Preenche Campos de Identificação
      document.getElementById("field-aluno").innerText = data.aluno || "";
      document.getElementById("field-unidade").innerText =
        data.unidade_escolar || "";
      document.getElementById("field-prof-adj").innerText =
        data.professor_adj || "";
      document.getElementById("field-prof").innerText =
        data.professor_regente || "";
      document.getElementById("field-turma").innerText = data.turma || "";
      document.getElementById("field-ano").innerText = data.ano_letivo || "";

      if (data.conteudo) {
        // --- PREENCHE AS DATAS SEM DESCONFIGURAR ---
        if (data.conteudo.d1) {
          document.getElementById("date-1").innerText = data.conteudo.d1;
          document.getElementById("date-2").innerText = data.conteudo.d2;
          document.getElementById("date-3").innerText = data.conteudo.d3;
          document.getElementById("date-4").innerText = data.conteudo.d4;
        }

        // --- PREENCHE AS 15 CÉLULAS ---
        for (let i = 1; i <= 15; i++) {
          const elemento = document.getElementById(`cell-${i}`);
          if (elemento) {
            elemento.innerText = data.conteudo[`cell${i}`] || "";
          }
        }
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
  }
}

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
// Executa assim que a página abre
carregarSemanarios();
