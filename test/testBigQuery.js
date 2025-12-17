// testBigQuery.js
require("dotenv").config(); // Carrega as variáveis de ambiente

const { readDataFromBigQuery } = require("../src/bigqueryService");

async function runTest() {
  const datasetId = process.env.BIGQUERY_DATASET_ID;
  const tableId = process.env.BIGQUERY_TABLE_ID;

  if (!datasetId || !tableId) {
    console.error(
      "Erro: BIGQUERY_DATASET_ID ou BIGQUERY_TABLE_ID não estão definidos no .env."
    );
    console.error(
      "Por favor, verifique se seu arquivo .env contém esses valores corretamente."
    );
    return;
  }

  console.log(`Iniciando teste de leitura do BigQuery...`);
  console.log(`Projeto: ${process.env.BIGQUERY_PROJECT_ID}`);
  console.log(`Dataset: ${datasetId}`);
  console.log(`Tabela: ${tableId}`);

  try {
    const data = await readDataFromBigQuery(datasetId, tableId);
    console.log("\n--- Dados Lidos com Sucesso ---");
    // Para evitar mostrar muitos dados, vamos exibir apenas os 5 primeiros registros
    // ou uma mensagem se não houver dados.
    if (data && data.length > 0) {
      console.log(`Total de registros lidos: ${data.length}`);
      console.log("Primeiros 5 registros (ou menos, se houver):");
      console.log(JSON.stringify(data.slice(0, 5), null, 2)); // Exibe os primeiros 5 em formato JSON legível
    } else {
      console.log(
        "Nenhum registro encontrado na tabela especificada ou a query retornou vazia."
      );
    }
    console.log("\nTeste de leitura do BigQuery concluído.");
  } catch (error) {
    console.error("\n--- Erro durante o teste de leitura do BigQuery ---");
    console.error("Detalhes do erro:", error.message);
    // Exibe o erro completo para debug, se necessário
    // console.error(error);
    console.error("\nPor favor, verifique:");
    console.error(
      "1. Suas credenciais no arquivo `bigquery-credentials.json`."
    );
    console.error(
      "2. As permissões da sua conta de serviço no Google Cloud (BigQuery Data Viewer)."
    );
    console.error(
      "3. Os IDs do projeto, dataset e tabela no seu arquivo `.env`."
    );
    console.error(
      "4. A localização do seu dataset BigQuery no `bigqueryService.js` (variável `location`)."
    );
    console.error(
      "5. Se o arquivo `bigquery-credentials.json` está presente na raiz e `.env` aponta para ele."
    );
  }
}

runTest();
