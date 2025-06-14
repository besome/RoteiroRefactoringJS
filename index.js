const { readFileSync } = require('fs');

function formatarMoeda(valor){
    return new Intl.NumberFormat("pt-BR",
                          { style: "currency", currency: "BRL",
                            minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(apresentacao){
  return pecas[apresentacao.id];
}

function calcularCredito(apre){
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(apre).tipo === "comedia")
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
}
function calcularTotalCreditos(){
    let valor = 0;
    for (let apre of faturas.apresentacoes){
      valor+= calcularCredito(apre);
    }
    return valor;
}

function calcularTotalApresentacao (apre){
  let total = 0;
  if (getPeca(apre).tipo == "tragedia"){
    total = 40000;
    if(apre.audiencia > 30){
      total += 1000 * (apre.audiencia - 30);
    }
    return total;
  }
  if (getPeca(apre).tipo == "comedia"){
    total = 30000;
    if(apre.audiencia > 20){
     total += 10000 + 500 * (apre.audiencia - 20);
    }
      total += 300 * apre.audiencia;
      return total;
    }
  throw new Error(`Peça desconhecia: ${getPeca(apre).tipo}`);
  
}

function calcularTotalFatura(){
    let total = 0;
    for (let apre of faturas.apresentacoes){
      total+= calcularTotalApresentacao(apre);
    }
    return total;
}

function gerarFaturaStr (fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura())}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos()} \n`;
  return faturaStr;
}

function gerarFaturaHTML(fatura, pecas) {
  let html = `<html>\n`;
  html += `<p> Fatura ${fatura.cliente} </p>\n`;
  html += `<ul>\n`;
  
  let totalFatura = 0;
  let totalCreditos = 0;

  for (let apre of fatura.apresentacoes) {
    const peca = getPeca(apre, pecas);
    const totalApresentacao = calcularTotalApresentacao(apre, pecas);
    html += `  <li> ${peca.nome}: ${formatarMoeda(totalApresentacao)} (${apre.audiencia} assentos) </li>\n`;
    totalFatura += totalApresentacao;
    totalCreditos += calcularCredito(apre);
  }

  html += `</ul>\n`;
  html += `<p> Valor total: ${formatarMoeda(totalFatura)} </p>\n`;
  html += `<p> Créditos acumulados: ${totalCreditos} </p>\n`;
  html += `</html>`;
  
  return html;
}
  

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
const faturaHTML = gerarFaturaHTML(faturas,pecas);
console.log(faturaStr);
console.log(faturaHTML);
