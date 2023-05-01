const { Schema, model } = require('mongoose');

const edificio = new Schema({
    name: String
})

module.exports = model (`Edificio`, edificio)