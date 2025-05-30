// === BUSCAR CLIENTE ===
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

    // Preencher campos se desejar
    document.getElementById('telefone').value = cliente.telefone || '';
    document.getElementById('endereco').value = cliente.endereco || '';
  }
});


// === VALIDAÇÃO DE IMEI ===
function validarIMEI(imei) {
  if (!/^\d{15}$/.test(imei)) return false;

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

// Evento de validação no campo IMEI
window.addEventListener('DOMContentLoaded', () => {
  const imeiInput = document.getElementById('imei');
  if (imeiInput) {
    imeiInput.addEventListener('blur', () => {
      const imei = imeiInput.value.trim();
      if (imei === '') return;

      if (!validarIMEI(imei)) {
        alert('❌ IMEI inválido! Verifique.');
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


// === SALVAR FICHA ===
document.getElementById('btnSalvarFicha').addEventListener('click', () => {
  const ficha = {
    cliente: document.getElementById('nomeCliente').value.trim(),
    marca: document.getElementById('marca').value.trim(),
    modelo: document.getElementById('modelo').value.trim(),
    cor: document.getElementById('cor').value.trim(),
    imei: document.getElementById('imei').value.trim(),
    defeito: document.getElementById('defeito').value.trim(),
    senha: document.getElementById('senha').value.trim(),
    valor: document.getElementById('valor').value.trim(),
    status: document.getElementById('status').value.trim(),
    data: new Date().toLocaleString()
  };

  if (!ficha.cliente) {
    alert('⚠️ Informe o nome do cliente!');
    return;
  }

  if (!validarIMEI(ficha.imei)) {
    alert('⚠️ IMEI inválido!');
    return;
  }

  window.api.salvarFicha(ficha);
  alert('✅ Ficha salva com sucesso!');
});

document.getElementById('btnEditarFicha').addEventListener('click', () => {
  alert("🛠️ Função Editar acionada!");
});


document.getElementById('btnExcluirFicha').addEventListener('click', () => {
  const confirma = confirm("Tem certeza que deseja excluir este registro?");
  if (confirma) {
    alert("🗑️ Registro excluído com sucesso!");
  }
});
