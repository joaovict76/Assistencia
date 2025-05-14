
const { contextBridge, ipcRenderer } = require('electron')
ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),   
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    newClient: (client) => ipcRenderer.send('new-client', client),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    searchName: (cliName) => ipcRenderer.send('search-name', cliName),
    renderClient: (client) => ipcRenderer.on('render-client', client),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setName: (args) => ipcRenderer.on('set-name', args),
    deleteClient: (id) => ipcRenderer.send('delete-client', id),
    updateClient: (client) => ipcRenderer.send('update-client', client),
    setCpf: (args) => ipcRenderer.on('set-cpf', args)
})