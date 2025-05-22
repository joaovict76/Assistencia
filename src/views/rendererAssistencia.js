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

  const inputImei = document.getElementById('imei')
const inputModelo = document.getElementById('modelo')
const inputCor = document.getElementById('cor')

inputImei.addEventListener('input', () => {
    if (inputImei.value.length === 15) {
        window.api.imeiSearch(inputImei.value)
    }
})

window.api.setImeiInfo((event, data) => {
    inputModelo.value = data.modelo
    inputCor.value = data.cor
})
  