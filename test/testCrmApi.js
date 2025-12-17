// testcrmApi.js
require("dotenv").config(); // Carrega as variáveis de ambiente

const {
  getPipeOpportunities,
  getAllApiConfigs,
} = require("../src/crmApiService");

async function runTest() {
  console.log(`Iniciando teste de chamada à API de Terceiros...`);

  const configs = getAllApiConfigs();

  if (!configs || configs.length === 0) {
    console.error(
      "Erro: Nenhuma configuração de API de terceiros encontrada em CRM_API_CONFIGS no .env."
    );
    console.error(
      "Por favor, verifique se seu arquivo .env contém a variável CRM_API_CONFIGS com um JSON válido."
    );
    return;
  }

  // Vamos testar apenas com a primeira configuração encontrada
  const testConfig = configs[0];
  console.log(`Testando com queueId: ${testConfig.queueId}`);

  try {
    const data = await getPipeOpportunities(
      testConfig.queueId,
      testConfig.apiKey,
      testConfig.pipelineId
    );
    console.log("\n--- Dados da API de Terceiros Recebidos com Sucesso ---");
    // Para evitar mostrar muitos dados, vamos exibir apenas os 5 primeiros registros
    // e confirmar a estrutura esperada.
    if (data && data.length > 0) {
      console.log(`Total de registros recebidos: ${data.length}`);
      console.log("Primeiros 5 registros (ou menos, se houver):");
      console.log(JSON.stringify(data.slice(0, 5), null, 2)); // Exibe os primeiros 5 em formato JSON legível

      // Validação da estrutura dos campos
      const sampleRecord = data[0];
      console.log("\n--- Verificando estrutura do primeiro registro ---");
      if (
        sampleRecord.hasOwnProperty("id") &&
        sampleRecord.hasOwnProperty("clientid") &&
        sampleRecord.hasOwnProperty("title")
      ) {
        console.log(
          "Estrutura de campos esperada (id, clientid, title) confirmada."
        );
      } else {
        console.warn(
          "Atenção: A estrutura dos campos retornados pode não ser exatamente a esperada (id, clientid, title)."
        );
        console.warn(
          "Campos encontrados no primeiro registro:",
          Object.keys(sampleRecord)
        );
      }
    } else {
      console.log(
        "Nenhum registro encontrado pela API de terceiros ou a resposta veio vazia."
      );
    }
    console.log("\nTeste de chamada à API de Terceiros concluído.");
  } catch (error) {
    console.error(
      "\n--- Erro durante o teste de chamada à API de Terceiros ---"
    );
    console.error("Detalhes do erro:", error.message);
    // Exibe o erro completo para debug, se necessário:
    // console.error(error.response?.data || error); // Para ver a resposta de erro da API
    console.error("\nPor favor, verifique:");
    console.error(
      "1. A `CRM_API_BASE_URL` e `CRM_API_ENDPOINT` no seu arquivo `.env`."
    );
    console.error(
      "2. O formato JSON da variável `CRM_API_CONFIGS` no seu `.env`."
    );
    console.error(
      "3. Se a `apiKey`, `queueId` e `pipelineId` na configuração de teste estão corretos e têm as permissões necessárias."
    );
    console.error(
      "4. A URL e o método HTTP da requisição (POST para `/int/getPipeOpportunities`)."
    );
  }
}

runTest();
