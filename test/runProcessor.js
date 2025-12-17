// runProcessor.js
const { processData } = require("../src/dataProcessorService");

async function main() {
  console.log("--- Iniciando a execução principal do processador de dados ---");
  await processData();
  console.log("--- Execução principal do processador de dados concluída ---");
  // Pode ser interessante adicionar um process.exit(0) aqui para garantir que o script termine
  // process.exit(0);
}

main().catch(console.error);
