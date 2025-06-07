const mongoose = require('mongoose')

const Assistencia = mongoose.model('Assistencia', {
    nomeCliente: { type: String, required: true },
    cpfCliente: { type: String },
    telefoneCliente: { type: String },
    marca: { type: String },
    modelo: { type: String },
    cor: { type: String },
    imei: { type: String },
    senha: { type: String },
    descricaoDefeito: { type: String },
    diagnostico: { type: String },
    valor: { type: Number },
    status: { type: String },
    data: { type: Date, default: Date.now }
})

module.exports = Assistencia
