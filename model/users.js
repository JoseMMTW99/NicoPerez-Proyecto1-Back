const { Schema, model } = require('mongoose');

const user = new Schema({
    name: String,
    surname: String,
    email: String,  
    password: String,
    dni: String,
    edificio: String,
    piso: String,
    puerta: String,
    tipo: String,
    baulera: String,
    date: String,
    dateComprobante: String,
    role: String
})

module.exports = model (`User`, user)