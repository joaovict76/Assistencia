const { contextBridge, ipcRenderer } = require('electron')

ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),
    dbStatus: (callback) => ipcRenderer.once('db-status', callback),
    newClient: (client) => ipcRenderer.send('new-client', client),
    resetForm: (callback) => ipcRenderer.once('reset-form', callback),
    searchName: (cliName) => ipcRenderer.send('search-name', cliName),
    renderClient: (callback) => ipcRenderer.once('render-client', callback),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setName: (callback) => ipcRenderer.once('set-name', callback),
    deleteClient: (id) => ipcRenderer.send('delete-client', id),
    updateClient: (client) => ipcRenderer.send('update-client', client),
    setCpf: (callback) => ipcRenderer.once('set-cpf', callback),
    imeiSearch: (imei) => ipcRenderer.send('imei-search', imei),
    setImeiInfo: (callback) => ipcRenderer.once('imei-result', callback),
    salvarFicha: (ficha) => ipcRenderer.send('salvar-ficha', ficha),
    lerFichas: (callback) => ipcRenderer.once('render-fichas', callback),
    deletarFicha: (id) => ipcRenderer.send('deletar-ficha', id),
    gerarRelatorioFicha: () => ipcRenderer.send('gerar-relatorio-ficha'),
    removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback)
})
