// rendererAssistencia.js

let fichaAtualId = null; // Armazena o ID da ficha carregada (para edição/exclusão)

// Coleta os dados do formulário
function coletarDadosFormulario() {
    return {
        nomeCliente: document.getElementById('nomeCliente').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        modelo: document.getElementById('modelo').value.trim(),
        cor: document.getElementById('cor').value.trim(),
        imei: document.getElementById('imei').value.trim(),
        senha: document.getElementById('senha').value.trim(),
        defeito: document.getElementById('defeito').value.trim(),
        valor: parseFloat(document.getElementById('valor').value) || 0,
        status: document.getElementById('status').value,
        // Adicione campos de data se existirem no seu modelo (ex: dataEntrada, dataConclusao)
        // dataEntrada: new Date().toISOString(), // Exemplo: data atual ao coletar
        // dataConclusao: null // Exemplo: para preencher posteriormente
    };
}

// Preenche os campos do formulário com os dados de uma ficha de assistência
function preencherFormulario(dados) {
    document.getElementById('nomeCliente').value = dados.nomeCliente || '';
    document.getElementById('marca').value = dados.marca || '';
    document.getElementById('modelo').value = dados.modelo || '';
    document.getElementById('cor').value = dados.cor || '';
    document.getElementById('imei').value = dados.imei || '';
    document.getElementById('senha').value = dados.senha || '';
    document.getElementById('defeito').value = dados.defeito || '';
    document.getElementById('valor').value = dados.valor || '';
    document.getElementById('status').value = dados.status || 'pendente';
    // Se seu modelo de Assistência incluir o foneCliente, preencha também:
    // document.getElementById('telefone').value = dados.foneCliente || '';
    // Você pode limpar as validações de IMEI ao preencher um formulário
    const imeiInput = document.getElementById('imei');
    if (imeiInput) {
        imeiInput.classList.remove('is-invalid', 'is-valid');
    }
}

// Resetar o formulário e ID da ficha atual
function resetForm() {
    document.querySelector('form').reset();
    fichaAtualId = null;
    // Limpar estilos de validação do IMEI
    const imeiInput = document.getElementById('imei');
    if (imeiInput) {
        imeiInput.classList.remove('is-invalid', 'is-valid');
    }
    // Limpar o campo de telefone também
    document.getElementById('telefone').value = '';
}

// --- Busca de Cliente para preencher campos da ficha ---
document.getElementById('btnBuscarCliente').addEventListener('click', () => {
    const nome = document.getElementById('nomeCliente').value.trim();
    if (nome) {
        window.api.buscarCliente(nome); // Chama IPC no preload.js
    } else {
        alert('Por favor, digite o nome do cliente para buscar.');
    }
});

window.api.clienteEncontrado((event, cliente) => {
    // Preenche nome e telefone do cliente encontrado
    document.getElementById('nomeCliente').value = cliente.nomeCliente;
    document.getElementById('telefone').value = cliente.foneCliente || '';
    alert('Cliente encontrado e dados preenchidos!');
});

window.api.clienteNaoEncontrado(() => {
    alert('Cliente não encontrado.');
    // Limpa apenas o telefone, mantém o nome digitado para nova busca
    document.getElementById('telefone').value = '';
});

window.api.erroBuscaCliente(() => {
    alert('Ocorreu um erro ao buscar o cliente. Verifique o console.');
    document.getElementById('telefone').value = '';
});

// --- CRUD: Salvar nova ficha (usando IPC) ---
document.getElementById('btnSalvarFicha').addEventListener('click', async () => {
    const dados = coletarDadosFormulario();

    try {
        const response = await window.api.salvarFicha(dados); // Chama IPC (invoke)
        if (response.success) {
            alert(response.message);
            fichaAtualId = response.ficha._id; // Armazena o ID da ficha salva
            // Opcional: recarrega a ficha salva ou reseta o formulário
            // preencherFormulario(response.ficha);
            // resetForm();
        } else {
            let errorMessage = response.message;
            if (response.errors) { // Se houver erros de validação do Mongoose
                errorMessage += '\nDetalhes: ' + Object.values(response.errors).join(', ');
            }
            alert(`Erro ao salvar ficha: ${errorMessage}`);
            console.error('Erro ao salvar ficha:', response);
        }
    } catch (err) {
        console.error('Erro inesperado ao salvar ficha via IPC:', err);
        alert('Erro inesperado ao salvar ficha. Verifique o console do desenvolvedor.');
    }
});

// --- CRUD: Editar ficha existente (usando IPC) ---
document.getElementById('btnEditarFicha').addEventListener('click', async () => {
    if (!fichaAtualId) {
        return alert('Nenhuma ficha carregada para editar. Por favor, carregue uma ficha primeiro.');
    }

    const dados = coletarDadosFormulario();

    try {
        const response = await window.api.editarFicha(fichaAtualId, dados); // Chama IPC (invoke)
        if (response.success) {
            alert(response.message);
            // Opcional: preencher formulário com dados atualizados do banco se algo mudou
            // preencherFormulario(response.ficha);
        } else {
            let errorMessage = response.message;
            if (response.errors) {
                errorMessage += '\nDetalhes: ' + Object.values(response.errors).join(', ');
            }
            alert(`Erro ao editar ficha: ${errorMessage}`);
            console.error('Erro ao editar ficha:', response);
        }
    } catch (err) {
        console.error('Erro inesperado ao editar ficha via IPC:', err);
        alert('Erro inesperado ao editar ficha. Verifique o console do desenvolvedor.');
    }
});

// --- CRUD: Excluir ficha (usando IPC) ---
document.getElementById('btnExcluirFicha').addEventListener('click', async () => {
    if (!fichaAtualId) {
        return alert('Nenhuma ficha carregada para excluir.');
    }

    const confirmDelete = confirm('Tem certeza que deseja excluir esta ficha?');
    if (!confirmDelete) return;

    try {
        const response = await window.api.excluirFicha(fichaAtualId); // Chama IPC (invoke)
        if (response.success) {
            alert(response.message);
            resetForm(); // Limpa o formulário após exclusão
        } else {
            alert(`Erro ao excluir ficha: ${response.message}`);
            console.error('Erro ao excluir ficha:', response);
        }
    } catch (err) {
        console.error('Erro inesperado ao excluir ficha via IPC:', err);
        alert('Erro inesperado ao excluir ficha. Verifique o console do desenvolvedor.');
    }
});

// --- Utilitário: Carregar Ficha por ID (Exemplo de como usar buscarFichaPorId) ---
// Você pode ligar isso a um botão "Carregar Ficha" ou a um item em uma lista de fichas
async function carregarFichaPorId(id) {
    try {
        const response = await window.api.buscarFichaPorId(id);
        if (response.success && response.ficha) {
            preencherFormulario(response.ficha);
            fichaAtualId = response.ficha._id;
            alert('Ficha carregada com sucesso!');
        } else {
            alert(`Erro ao carregar ficha: ${response.message}`);
            console.error('Erro ao carregar ficha por ID:', response);
        }
    } catch (error) {
        console.error('Erro inesperado ao carregar ficha por ID via IPC:', error);
        alert('Erro inesperado ao carregar ficha. Verifique o console.');
    }
}

// --- Validação de IMEI ---
// Chame window.api.imeiSearch aqui para verificar unicidade do IMEI
document.getElementById('imei').addEventListener('input', async () => {
    const imeiInput = document.getElementById('imei');
    const imei = imeiInput.value.trim();

    if (imei === '') {
        imeiInput.classList.remove('is-invalid', 'is-valid');
        return;
    }

    if (!validarIMEI(imei)) {
        alert('❌ IMEI inválido! Verifique o formato.');
        imeiInput.classList.add('is-invalid');
        imeiInput.classList.remove('is-valid');
        // imeiInput.focus(); // Evite focar automaticamente, pode ser irritante
        return;
    } else {
        imeiInput.classList.remove('is-invalid');
        imeiInput.classList.add('is-valid');
    }

    // Agora, verifique se o IMEI já existe no banco de dados via IPC
    try {
        // imeiSearch agora é 'invoke' e retorna um resultado
        const result = await window.api.imeiSearch(imei);
        if (result && result.message) { // result.message conteria "O número do IMEI já está cadastrado."
            alert(result.message);
            imeiInput.classList.add('is-invalid'); // Marca como inválido se já existir
            imeiInput.classList.remove('is-valid');
        } else {
            // Se não houver mensagem de erro, significa que o IMEI é válido e não duplicado
            imeiInput.classList.remove('is-invalid');
            imeiInput.classList.add('is-valid');
        }
    } catch (error) {
        console.error('Erro na validação de IMEI via IPC:', error);
        alert('Erro ao verificar IMEI no banco de dados.');
        imeiInput.classList.add('is-invalid');
    }
});

function validarIMEI(imei) {
    if (!/^\d{15}$/.test(imei)) return false;

    let soma = 0;
    for (let i = 0; i < 15; i++) {
        let num = parseInt(imei.charAt(i), 10);
        if (i % 2 === 1) { // Posições ímpares (0-indexed)
            num *= 2;
            if (num > 9) num -= 9;
        }
        soma += num;
    }
    return soma % 10 === 0;
}

// Certifique-se de que a função resetForm está acessível (já está no escopo global)
// window.addEventListener('DOMContentLoaded', () => { ... }); -> Não é estritamente necessário para IMEI input, pois o evento 'input' já é suficiente.