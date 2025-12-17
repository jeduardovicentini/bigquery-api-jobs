// app.js
require("dotenv").config(); // Carrega as variáveis de ambiente primeiro
const express = require("express");
const cors = require("cors"); // Para habilitar CORS, se sua API for acessada por front-ends
const { processData } = require("./src/dataProcessorService"); // Importa a função principal
const app = express();
const PORT = process.env.PORT || 3000; // Porta do servidor, padrão 3000

// Middlewares
app.use(cors()); // Habilita o CORS
app.use(express.json()); // Permite que a API receba JSON no corpo das requisições

// Rota para disparar o processamento de dados
app.post("/process-data", async (req, res) => {
  console.log("Endpoint /process-data chamado. Iniciando processamento...");
  try {
    // Você pode adicionar uma validação de API Key aqui para segurança adicional
    // if (req.body.secretKey !== process.env.CRON_JOB_SECRET_KEY) {
    //   return res.status(403).json({ message: 'Acesso não autorizado.' });
    // }

    await processData(); // Chama a função que contém a lógica principal
    res
      .status(200)
      .json({
        message: "Processamento de dados iniciado com sucesso e concluído.",
      });
  } catch (error) {
    console.error("Erro no endpoint /process-data:", error);
    res
      .status(500)
      .json({
        message: "Erro interno ao processar dados.",
        error: error.message,
      });
  }
});

// Rota de saúde (health check)
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "API está online e saudável." });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
