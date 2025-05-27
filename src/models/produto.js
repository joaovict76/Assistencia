const mongoose = require('mongoose')
const Schema = mongoose.Schema




const ProdutoSchema = new Schema({
    nomeCliente: { type: String, required: true },
    cpfCliente: { type: String, required: true },
    marca: String,
    modelo: String,
    imei: String,
    defeito: String,
    diagnostico: String,
    observacao: String,
    dataEntrada: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Produto', ProdutoSchema)