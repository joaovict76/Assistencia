
const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('api', {
    // === APIs Comuns / Status do DB ===
    clientWindow: () => ipcRenderer.send('client-window'), // Se ainda usar para abrir a janela de cliente programaticamente
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback), // Utilitário para remover listeners

    // === APIs para Cadastro de Clientes (rendererCliente.js) ===
    newClient: (client) => ipcRenderer.send('new-client', client),
    resetForm: (args) => ipcRenderer.on('reset-form', args), // Listener para resetar formulário de cliente
    searchName: (cliName) => ipcRenderer.send('search-name', cliName),
    renderClient: (client) => ipcRenderer.on('render-client', client), // Listener para renderizar cliente encontrado
    validateSearch: () => ipcRenderer.send('validate-search'), // Se ainda usar para validação de busca
    setName: (args) => ipcRenderer.on('set-name', args), // Se ainda usar para setar nome
    deleteClient: (id) => ipcRenderer.send('delete-client', id),
    updateClient: (client) => ipcRenderer.send('update-client', client),
    setCpf: (args) => ipcRenderer.on('set-cpf', args), // Se ainda usar para setar CPF

    // === APIs para Assistência Técnica (rendererAssistencia.js) e Cliente (IMEI) ===
    imeiSearch: (imei) => ipcRenderer.invoke('imei-search', imei), // Mudado para invoke
    setImeiInfo: (callback) => ipcRenderer.once('imei-result', callback), // Listener para resultado do IMEI (pode ser ajustado se imeiSearch for invoke)

    // APIs para busca de cliente usada na Assistência (IPC Principal)
    buscarCliente: (nome) => ipcRenderer.send('buscar-cliente-nome', nome), // Corrigido para o canal correto
    clienteEncontrado: (callback) => ipcRenderer.on('cliente-encontrado', callback),
    clienteNaoEncontrado: (callback) => ipcRenderer.on('cliente-nao-encontrado', callback),
    erroBuscaCliente: (callback) => ipcRenderer.on('erro-busca-cliente', callback), // Adicionado para erros

    // APIs para CRUD de Fichas de Assistência (IPC Principal)
    salvarFicha: (fichaData) => ipcRenderer.invoke('salvar-ficha', fichaData), // Usar invoke
    editarFicha: (id, fichaData) => ipcRenderer.invoke('editar-ficha', id, fichaData), // Usar invoke
    excluirFicha: (id) => ipcRenderer.invoke('excluir-ficha', id), // Usar invoke
    buscarFichas: (query) => ipcRenderer.invoke('buscar-fichas', query), // Para ler/listar várias fichas
    buscarFichaPorId: (id) => ipcRenderer.invoke('buscar-ficha-por-id', id), // Para carregar uma ficha específica

    // API para Geração de Relatório de Ficha
    gerarRelatorioFicha: () => ipcRenderer.send('gerar-relatorio-ficha'),
});