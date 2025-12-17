// src/bigqueryService.js
const { BigQuery } = require("@google-cloud/bigquery");

// Carrega as variáveis de ambiente do arquivo .env
require("dotenv").config();

// Inicializa o cliente BigQuery usando o arquivo de credenciais
// Caminho para o arquivo de credenciais JSON
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Verifica se o caminho para as credenciais foi fornecido
if (!credentialsPath) {
  console.error(
    "Erro: A variável de ambiente GOOGLE_APPLICATION_CREDENTIALS não está definida."
  );
  console.error(
    "Certifique-se de que o caminho para o seu arquivo JSON de credenciais do BigQuery está configurado no .env."
  );
  process.exit(1); // Encerra o processo se as credenciais não estiverem configuradas
}

const bigquery = new BigQuery({
  projectId: process.env.BIGQUERY_PROJECT_ID, // Seu ID do projeto Google Cloud
  keyFilename: credentialsPath, // Caminho para o arquivo de credenciais
});

/**
 * Lê dados de uma tabela específica no Google BigQuery.
 * @param {string} datasetId - O ID do dataset do BigQuery.
 * @param {string} tableId - O ID da tabela do BigQuery.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de linhas da tabela.
 */
async function readDataFromBigQuery(datasetId, tableId) {
  try {
    const query = `SELECT * FROM \`${process.env.BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\``;
    const options = {
      query: query,
      location: "US", // Ou a localização do seu dataset (ex: 'southamerica-east1')
    };

    // Executa a query
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} iniciado.`);

    // Aguarda o job ser concluído
    const [rows] = await job.getQueryResults();
    console.log("Dados do BigQuery lidos com sucesso.");
    return rows;
  } catch (error) {
    console.error("Erro ao ler dados do BigQuery:", error);
    throw error;
  }
}

/**
 * Atualiza o campo 'status' de uma linha específica na tabela do BigQuery.
 * @param {string} datasetId - O ID do dataset do BigQuery.
 * @param {string} tableId - O ID da tabela do BigQuery.
 * @param {string} recordId - O valor do 'id' do registro a ser atualizado.
 * @param {string} newStatus - O novo status a ser definido.
 * @returns {Promise<void>} Uma promessa que resolve quando a atualização é concluída.
 */
async function updateBigQueryStatus(datasetId, tableId, recordId, newStatus) {
  try {
    const query = `
      UPDATE \`${process.env.BIGQUERY_PROJECT_ID}.${datasetId}.${tableId}\`
      SET status = @newStatus
      WHERE id = @recordId
    `;
    const options = {
      query: query,
      params: {
        newStatus: newStatus,
        recordId: Number(recordId),
      },
      location: "US", // *** LOCALIZAÇÃO DO SEU DATASET  ***
    };

    const [job] = await bigquery.createQueryJob(options);
    console.log(
      `BigQuery: Job ${job.id} de atualização para o ID ${recordId} iniciado.`
    );
    await job.getQueryResults(); // Aguarda a conclusão da atualização
    console.log(
      `BigQuery: Status do registro ID ${recordId} atualizado para '${newStatus}'.`
    );
  } catch (error) {
    console.error(
      `BigQuery: Erro ao atualizar status para o ID ${recordId}:`,
      error
    );
    throw error;
  }
}

module.exports = {
  readDataFromBigQuery,
  updateBigQueryStatus,
  bigquery, // Exporta o cliente BigQuery para outras operações, como updates
};
