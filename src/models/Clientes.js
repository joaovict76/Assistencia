const mongoose = require('mongoose')

const Clientes = mongoose.model('Clientes', {
    nomeCliente: { type: String, required: true },
    cpfCliente: { type: String, required: true, unique: true },
    emailCliente: { type: String },
    foneCliente: { type: String },
    cepCliente: { type: String },
    logradouroCliente: { type: String },
    numeroCliente: { type: String },
    complementoCliente: { type: String },
    bairroCliente: { type: String },
    cidadeCliente: { type: String },
    ufCliente: { type: String }
})

module.exports = Clientes
