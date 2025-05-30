const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProdutoSchema = new Schema({
  cliente: { type: String, required: true },       // nome do cliente
  marca: { type: String },
  modelo: { type: String },
  cor: { type: String },
  imei: { type: String },
  defeito: { type: String },
  senha: { type: String },
  valor: { type: String },          // pode ser Number se preferir
  status: { type: String },
  data: { type: Date, default: Date.now }  // data do registro
});

module.exports = mongoose.model('Produto', ProdutoSchema);
