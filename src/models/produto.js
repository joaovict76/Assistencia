const mongoose = require('mongoose')

const produtoSchema = new mongoose.Schema({
    nomeProduto: { type: String, required: true },
    codigoProduto: { type: String, required: true, unique: true },
    precoProduto: { type: Number, required: true },
    descricaoProduto: { type: String },
    estoqueProduto: { type: Number, required: true }
})

module.exports = mongoose.model('Produto', produtoSchema)
