document.getElementById('btnBuscarCliente').addEventListener('click', async () => {
    const nome = document.getElementById('nomeCliente').value.trim();
  
    if (!nome) {
      alert('Digite um nome!');
      return;
    }
  
    const clientes = await window.electronAPI.buscarCliente(nome);
  
    if (clientes.length === 0) {
      alert('Cliente não encontrado!');
    } else {
      const cliente = clientes[0];
      alert(`Cliente encontrado:\nNome: ${cliente.nome}\nTelefone: ${cliente.telefone}\nEndereço: ${cliente.endereco}`);
      // Aqui você pode preencher os campos do formulário
      // Exemplo:
      // document.getElementById('telefone').value = cliente.telefone;
    }
  });

  // Função de validação de IMEI (algoritmo de Luhn)
function validarIMEI(imei) {
  if (!/^\d{15}$/.test(imei)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 15; i++) {
    let num = parseInt(imei.charAt(i), 10);
    if (i % 2 === 1) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    soma += num;
  }
  return soma % 10 === 0;
}

// Evento de validação quando o campo perde o foco
window.addEventListener('DOMContentLoaded', () => {
  const imeiInput = document.getElementById('imei');

  if (imeiInput) {
    imeiInput.addEventListener('blur', () => {
      const imei = imeiInput.value.trim();

      if (imei === '') return;

      if (!validarIMEI(imei)) {
        alert('❌ IMEI inválido! Verifique e digite um IMEI correto com 15 dígitos.');
        imeiInput.classList.add('is-invalid');
        imeiInput.classList.remove('is-valid');
        imeiInput.focus();
      } else {
        imeiInput.classList.remove('is-invalid');
        imeiInput.classList.add('is-valid');
      }
    });
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
}

document.getElementById('btnSalvarFicha').addEventListener('click', () => {
  const ficha = {
      cliente: document.getElementById('nomeCliente').value.trim(),
      marca: document.getElementById('marca').value.trim(),
      modelo: document.getElementById('modelo').value.trim(),
      cor: document.getElementById('cor').value.trim(),
      imei: document.getElementById('imei').value.trim(),
      defeito: document.getElementById('defeito').value.trim(),
      diagnostico: document.getElementById('diagnostico').value.trim(),
      valor: document.getElementById('valor').value.trim(),
      status: document.getElementById('status').value.trim(),
      data: new Date().toLocaleString()
  }

  if (!ficha.cliente) {
      alert('⚠️ Informe o nome do cliente!')
      return
  }

  if (!validarIMEI(ficha.imei)) {
      alert('⚠️ IMEI inválido!')
      return
  }

  window.api.salvarFicha(ficha)
})