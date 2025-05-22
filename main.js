console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')
const path = require('node:path')
const { conectar, desconectar } = require('./database.js')
const clientModel = require('./src/models/Clientes.js')
const fs = require('fs')
const { default: jsPDF } = require('jspdf')

// ============ Janela principal ============
let win
const createWindow = () => {
    nativeTheme.themeSource = 'light'
    win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    win.loadFile('./src/views/index.html')
}

// ============ Janela Sobre ============
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    const about = new BrowserWindow({
        width: 360,
        height: 200,
        autoHideMenuBar: true,
        resizable: false,
        minimizable: false,
        parent: main,
        modal: true
    })
    about.loadFile('./src/views/sobre.html')
}

// ============ Janela Cliente ============
let client
function clientWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    client = new BrowserWindow({
        width: 1010,
        height: 680,
        parent: main,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    client.loadFile('./src/views/cliente.html')
    client.center()
}

// ============ Inicialização ============
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.commandLine.appendSwitch('log-level', '3')

app.on('before-quit', () => {
    desconectar()
})

// ============ Menu ============
const template = [
    {
        label: 'Cadastro',
        submenu: [
            { label: 'Clientes', click: () => clientWindow() },
            { type: 'separator' },
            { label: 'Sair', click: () => app.quit(), accelerator: 'Alt+F4' }
        ]
    },
    {
        label: 'Relatórios',
        submenu: [
            { label: 'Clientes', click: () => relatorioClientes() }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            { label: 'Aplicar zoom', role: 'zoomIn' },
            { label: 'Reduzir', role: 'zoomOut' },
            { label: 'Restaurar zoom', role: 'resetZoom' },
            { type: 'separator' },
            { label: 'Recarregar', role: 'reload' },
            { label: 'DevTools', role: 'toggleDevTools' }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            { label: 'Sobre', click: () => aboutWindow() }
        ]
    }
]

// ============ Banco de dados ============
ipcMain.on('db-connect', async (event) => {
    const conectado = await conectar()
    if (conectado) {
        setTimeout(() => {
            event.reply('db-status', "conectado")
        }, 500)
    }
})

// ============ Validação de CPF ============
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
}

// ============ CRUD - Create ============
ipcMain.on('new-client', async (event, client) => {
    if (!validarCPF(client.cpfCli)) {
        dialog.showMessageBox({
            type: 'error',
            title: "CPF inválido",
            message: "O CPF informado não é válido.",
            buttons: ['OK']
        })
        return
    }

    try {
        const newClient = new clientModel({
            nomeCliente: client.nameCli,
            cpfCliente: client.cpfCli,
            foneCliente: client.phoneCli,
            cepCliente: client.cepCli,
            logradouroCliente: client.addressCli,
            numeroCliente: client.numberCli,
            bairroCliente: client.neighborhoodCli,

        })
        await newClient.save()

        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso.",
            buttons: ['OK']
        }).then(() => event.reply('reset-form'))
    } catch (error) {
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Erro",
                message: "CPF já cadastrado.",
                buttons: ['OK']
            })
        } else {
            console.error("Erro ao salvar cliente:", error)
        }
    }
})

// ============ CRUD - Read ============
ipcMain.on('validate-search', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atenção',
        message: 'Preencha o campo busca.',
        buttons: ['OK']
    })
})

ipcMain.on('search-name', async (event, cliName) => {
    try {
        const isCpf = /^\d{11}$/.test(cliName.replace(/\D/g, ''))
        let client

        if (isCpf) {
            client = await clientModel.find({ cpfCliente: cliName })
        } else {
            client = await clientModel.find({
                nomeCliente: new RegExp(cliName, 'i')
            })
        }

        if (client.length === 0) {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Aviso',
                message: 'Cliente não cadastrado.\nDeseja cadastrar este cliente?',
                buttons: ['Sim', 'Não'],
                defaultId: 0
            }).then((result) => {
                if (result.response === 0) {
                    isCpf ? event.reply('set-cpf') : event.reply('set-name')
                }
            })
        } else {
            event.reply('render-client', JSON.stringify(client))
        }
    } catch (error) {
        console.error(error)
    }
})

// ============ CRUD - Update ============
ipcMain.on('update-client', async (event, client) => {
    try {
        const updateClient = await clientModel.findByIdAndUpdate(
            client.idCli,
            {
                nomeCliente: client.nameCli,
                cpfCliente: client.cpfCli,
                foneCliente: client.phoneCli,
                cepCliente: client.cepCli,
                logradouroCliente: client.addressCli,
                numeroCliente: client.numberCli,
                bairroCliente: client.neighborhoodCli,

            },
            { new: true }
        )

        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Dados atualizados com sucesso.",
            buttons: ['OK']
        }).then(() => event.reply('reset-form'))
    } catch (error) {
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "CPF já cadastrado.",
                buttons: ['OK']
            })
        } else {
            console.error(error)
        }
    }
})

// ============ CRUD - Delete ============
ipcMain.on('delete-client', async (event, id) => {
    const result = await dialog.showMessageBox(win, {
        type: 'warning',
        title: "Atenção!",
        message: "Tem certeza que deseja excluir este cliente?\nEsta ação não poderá ser desfeita.",
        buttons: ['Cancelar', 'Excluir']
    })
    if (result.response === 1) {
        try {
            await clientModel.findByIdAndDelete(id)
            event.reply('reset-form')
        } catch (error) {
            console.error(error)
        }
    }
})

// ============ Relatório PDF ============
async function relatorioClientes() {
    try {
        const doc = new jsPDF('p', 'mm', 'a4')
        const dataAtual = new Date().toLocaleDateString('pt-BR')

        doc.setFontSize(10)
        doc.text(`Data: ${dataAtual}`, 170, 15)
        doc.setFontSize(18)
        doc.text("Relatório de clientes", 15, 30)

        doc.setFontSize(12)
        let y = 50

        doc.text("Nome", 14, y)
        doc.text("Telefone", 85, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10

        const clientes = await clientModel.find().sort({ nomeCliente: 1 })

        clientes.forEach((c) => {
            if (y > 280) {
                doc.addPage()
                y = 20
                doc.text("Nome", 14, y)
                doc.text("Telefone", 85, y)
                y += 5
                doc.line(10, y, 200, y)
                y += 10
            }
            doc.text(c.nomeCliente, 15, y)
            doc.text(c.foneCliente, 85, y)
            y += 10
        })

        const pages = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pages; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Página ${i} de ${pages}`, 105, 290, { align: 'center' })
        }

        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'clientes.pdf')
        doc.save(filePath)
        shell.openPath(filePath)

    } catch (error) {
        console.error(error)
    }
}
const imeiData = [
    { imei: '123456789012345', modelo: 'iPhone 14', cor: 'Preto' },
    { imei: '987654321098765', modelo: 'Samsung S23', cor: 'Azul' }
    // Aqui você pode colocar sua base ou até conectar a um banco externo
]

ipcMain.on('imei-search', (event, imei) => {
    const result = imeiData.find(item => item.imei === imei)
    if (result) {
        event.sender.send('set-imei-info', result)
    } else {
        event.sender.send('set-imei-info', { modelo: 'Não encontrado', cor: 'Não encontrado' })
    }
})