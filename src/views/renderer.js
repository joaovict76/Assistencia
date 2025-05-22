/**
 * Processo de renderização
 * Tela principal
 */

console.log("Processo de renderização")

// Envio de uma mensagem para o main abrir a janela clinte
function client() {
  //console.log("teste do botão cliente")
  //uso da api(autorizada no preload.js)
 window.location.href = "cliente.html"
}
function assist() {
  // abrir tela de assistência técnica
  window.location.href = "assistencia.html";
}

// Troca do ícone do banco de dados (usando a api do preload.js)
api.dbStatus((event, message) => {
    //teste do recebimento da mensagem do main
    console.log(message)
    if (message === "conectado") {
        document.getElementById('statusdb').src = "../public/img/dbon.png"
    } else {
        document.getElementById('statusdb').src = "../public/img/dboff.png"
    }
})
