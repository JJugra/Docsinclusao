const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Permite que o servidor entregue arquivos estáticos (HTML, JS, CSS)
app.use(express.static(__dirname));

// Rota principal: ao abrir localhost:3000, ele vai para o login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.listen(port, () => {
  console.log(`🚀 Servidor de testes iniciado!`);
  console.log(`🔗 Acesse: http://localhost:${port}`);
});
