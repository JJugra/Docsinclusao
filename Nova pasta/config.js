// config.js

// Se as variáveis globais existirem (injetadas pelo Netlify), usa elas.
// Caso contrário (rodando local), usa os valores manuais.
const supabaseUrl =
  window.ENV_SUPABASE_URL || "https://goinbvlnhugizbobdzvc.supabase.co";
const supabaseKey =
  window.ENV_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvaW5idmxuaHVnaXpib2JkenZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODEwMDIsImV4cCI6MjA4OTQ1NzAwMn0.iHd_VGkYWprtPeGeYw2dk-X6T3cFWmh2OolGDA_xZEM";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
let idSemanarioAberto = null;

console.log("Conexão com Supabase configurada!");
