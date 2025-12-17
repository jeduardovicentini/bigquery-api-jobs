// src/crmApiService.js
const axios = require("axios");
require("dotenv").config(); // Garante que as variáveis de ambiente sejam carregadas

const API_BASE_URL = process.env.CRM_API_BASE_URL;
const API_ENDPOINT = process.env.CRM_API_ENDPOINT;

// Carrega as configurações dos queues da variável de ambiente
let apiConfigs = [];
try {
  if (process.env.CRM_API_CONFIGS) {
    apiConfigs = JSON.parse(process.env.CRM_API_CONFIGS);
  } else {
    console.warn("Variável de ambiente CRM_API_CONFIGS não encontrada.");
  }
} catch (error) {
  console.error("Erro ao fazer parse da variável CRM_API_CONFIGS:", error);
  console.error(
    "Verifique se o JSON na sua variável de ambiente está formatado corretamente."
  );
}

/**
 * Faz uma requisição à API de terceiros para obter oportunidades de pipeline.
 * @param {number} queueId - O ID da fila.
 * @param {string} apiKey - A chave da API para autenticação.
 * @param {number} pipelineId - O ID do pipeline.
 * @returns {Promise<Array>} Uma promessa que resolve para os dados retornados pela API.
 */
async function getPipeOpportunities(queueId, apiKey, pipelineId) {
  const url = `${API_BASE_URL}${API_ENDPOINT}`;
  const data = {
    queueId: queueId,
    apiKey: apiKey,
    pipelineId: pipelineId,
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(
      `Dados da API de Terceiros para queueId ${queueId} obtidos com sucesso.`
    );
    return response.data; // A API retorna dados diretamente no corpo da resposta
  } catch (error) {
    console.error(
      `Erro ao chamar a API de Terceiros para queueId ${queueId}:`,
      error.message
    );
    // Pode ser útil logar o erro completo para depuração: error.response?.data
    throw error;
  }
}

/**
 * Retorna todas as configurações de API carregadas do .env.
 * @returns {Array<Object>} Um array de objetos, cada um com queueId, apiKey e pipelineId.
 */
function getAllApiConfigs() {
  return apiConfigs;
}

module.exports = {
  getPipeOpportunities,
  getAllApiConfigs,
};
