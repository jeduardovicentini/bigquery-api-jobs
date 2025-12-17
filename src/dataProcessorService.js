// src/dataProcessorService.js
const {
  readDataFromBigQuery,
  updateBigQueryStatus,
} = require("./bigqueryService");
const { getPipeOpportunities, getAllApiConfigs } = require("./crmApiService");
require("dotenv").config();

const BIGQUERY_DATASET_ID = process.env.BIGQUERY_DATASET_ID;
const BIGQUERY_TABLE_ID = process.env.BIGQUERY_TABLE_ID;

/**
 * Processa os dados, comparando BigQuery com a API de Terceiros e atualizando o status.
 */
async function processData() {
  if (!BIGQUERY_DATASET_ID || !BIGQUERY_TABLE_ID) {
    console.error(
      "Erro: BIGQUERY_DATASET_ID ou BIGQUERY_TABLE_ID não estão definidos no .env."
    );
    return;
  }

  try {
    console.log("Iniciando processamento de dados...");

    // 1. Ler todos os IDs e status do BigQuery
    const bigQueryRows = await readDataFromBigQuery(
      BIGQUERY_DATASET_ID,
      BIGQUERY_TABLE_ID
    );
    // Cria um Set para IDs para busca eficiente e um Map para acesso rápido ao status original
    const bigQueryIdsSet = new Set(bigQueryRows.map((row) => String(row.id)));
    const bigQueryIdToStatusMap = new Map(
      bigQueryRows.map((row) => [String(row.id), row.status])
    );

    console.log(`BigQuery: ${bigQueryIdsSet.size} IDs únicos lidos.`);

    // 2. Ler dados da API de Terceiros para todas as configurações
    const apiConfigs = getAllApiConfigs();
    let crmApiIds = new Set();

    if (apiConfigs.length === 0) {
      console.warn(
        "Nenhuma configuração de API de Terceiros encontrada. Pulando a leitura da API."
      );
    } else {
      for (const config of apiConfigs) {
        try {
          console.log(
            `API Terceiros: Buscando oportunidades para queueId ${config.queueId}...`
          );
          const apiData = await getPipeOpportunities(
            config.queueId,
            config.apiKey,
            config.pipelineId
          );
          apiData.forEach((item) => crmApiIds.add(String(item.id))); // Adiciona IDs da API, convertendo para String
          console.log(
            `API Terceiros: ${apiData.length} itens recebidos para queueId ${config.queueId}.`
          );
        } catch (apiError) {
          console.error(
            `API Terceiros: Falha ao buscar dados para queueId ${config.queueId}: ${apiError.message}`
          );
          // Continua para a próxima configuração mesmo que uma falhe
        }
      }
      console.log(`API Terceiros: ${crmApiIds.size} IDs únicos coletados.`);
    }

    // 3. Comparar e identificar IDs do BigQuery não encontrados na API e que podem ser atualizados
    const idsToUpdate = [];
    for (const bigQueryId of bigQueryIdsSet) {
      // Iterar sobre os IDs do BigQuery
      if (!crmApiIds.has(bigQueryId)) {
        // Se o ID do BigQuery não foi encontrado na API de terceiros
        const currentStatus = bigQueryIdToStatusMap.get(bigQueryId);

        // Verifica a nova regra: não atualizar se o status for '1' ou '2'
        if (currentStatus === "1" || currentStatus === "2") {
          console.log(
            `BigQuery: Registro ID ${bigQueryId} não será atualizado. Status atual é '${currentStatus}'.`
          );
        } else if (currentStatus === "não_encontrado") {
          console.log(
            `BigQuery: Registro ID ${bigQueryId} já está 'não_encontrado'. Nenhuma atualização necessária.`
          );
        } else {
          // Se não foi encontrado na API, não está '1' ou '2', e não é 'não_encontrado', adicionar para atualização
          idsToUpdate.push(bigQueryId);
        }
      }
    }

    console.log(
      `BigQuery: ${idsToUpdate.length} IDs precisam ser atualizados para 'não_encontrado'.`
    );

    // 4. Atualizar o status no BigQuery para os IDs identificados
    if (idsToUpdate.length > 0) {
      for (const id of idsToUpdate) {
        await updateBigQueryStatus(
          BIGQUERY_DATASET_ID,
          BIGQUERY_TABLE_ID,
          id,
          "99"
        );
      }
      console.log("BigQuery: Todas as atualizações de status concluídas.");
    } else {
      console.log(
        'BigQuery: Nenhum ID para atualizar. Todos os registros do BigQuery foram encontrados na API de Terceiros, já tinham o status "1" ou "2", ou já estavam com status "não_encontrado".'
      );
    }

    console.log("Processamento de dados concluído com sucesso.");
  } catch (error) {
    console.error("Erro fatal durante o processamento de dados:", error);
  }
}

module.exports = {
  processData,
};
