const { readFileSync } = require('fs');

class ServicoCalculoFatura {

  calcularCredito(pecas,apre){
    let peca = pecas[apre.id]
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (peca.tipo === "comedia")
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }
  
  calcularTotalCreditos(pecas,apresentacoes){
      let valor = 0;
      for (let apre of apresentacoes){
        valor+= this.calcularCredito(pecas,apre);
      }
      return valor;
  }

  calcularTotalApresentacao (pecas,apre){
    let total = 0;
    let peca = pecas[apre.id];
    if (peca.tipo == "tragedia"){
      total = 40000;
      if(apre.audiencia > 30){
        total += 1000 * (apre.audiencia - 30);
      }
      return total;
    }
    if (peca.tipo == "comedia"){
      total = 30000;
      if(apre.audiencia > 20){
      total += 10000 + 500 * (apre.audiencia - 20);
      }
        total += 300 * apre.audiencia;
        return total;
      }
    throw new Error(`Peça desconhecia: ${peca.tipo}`);
    
  }

  calcularTotalFatura(pecas, apresentacao){
    let total = 0;
    for (let apre of apresentacao){
      total+= this.calcularTotalApresentacao(pecas,apre);
    }
    return total;
  }
}

function formatarMoeda(valor){
    return new Intl.NumberFormat("pt-BR",
                          { style: "currency", currency: "BRL",
                            minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(apresentacao){
  return pecas[apresentacao.id];
}

function gerarFaturaStr (fatura, pecas, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas,apre))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas,fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas,fatura.apresentacoes)} \n`;
  return faturaStr;
}

/*function gerarFaturaHTML(fatura, pecas, calc) {
  let html = `<html>\n`;
  html += `<p> Fatura ${fatura.cliente} </p>\n`;
  html += `<ul>\n`;
  
  let totalFatura = 0;
  let totalCreditos = 0;

  for (let apre of fatura.apresentacoes) {
    const peca = getPeca(apre, pecas);
    const totalApresentacao = calc.calcularTotalApresentacao(pecas, apre);
    html += `  <li> ${peca.nome}: ${formatarMoeda(totalApresentacao)} (${apre.audiencia} assentos) </li>\n`;
    totalFatura += totalApresentacao;
    totalCreditos += calc.calcularCredito(pecas,apre);
  }

  html += `</ul>\n`;
  html += `<p> Valor total: ${formatarMoeda(totalFatura)} </p>\n`;
  html += `<p> Créditos acumulados: ${totalCreditos} </p>\n`;
  html += `</html>`;
  
  return html;
}
*/


const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const calc = new ServicoCalculoFatura();
const faturaStr = gerarFaturaStr(faturas, pecas,calc);
//const faturaHTML = gerarFaturaHTML(faturas,pecas,calc);
console.log(faturaStr);
//console.log(faturaHTML);
