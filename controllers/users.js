const User = require('../model/users');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const claveToken = process.env.CLAVE;

const getUser = async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).send(users);
    } catch (error) {
        res.status(206).json({ error: error.message });
    }
}

const getUserEspecifico = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(206).send('Invalid user ID');
    }
      try {
        const user = await User.findById(id);
        res.status(200).send(user);
      } catch (error) {
        res.status(206).json({ error: error.message });
      }
    }

const crearUser = async (req, res) => {
    const { name, surname, email, password, dni, edificio, piso, puerta, role } = req.body;
    const userExistentes = await User.findOne({"dni": dni})
    const userExistentesEmail = await User.findOne({"email": email})
    if (userExistentes) {
        res.status(206).send(`Este documento ya existe.`)
    } else if (userExistentesEmail){
        res.status(206).send(`Este correo electrónico ya esta en uso.`)
    } else {
        const nuevoUser = new User({
            name,
            surname,
            email,
            password,
            dni,
            edificio,
            piso,
            puerta,
            role
        })
        await nuevoUser.save()
        res.status(200).send(`Se creo el usuario con éxito.`)
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.body
    if (id) {
        await User.findByIdAndDelete(id);
        res.status(200).send(`Se elimino el usuario con éxito.`)
    } else{
        res.status(206).send(`No id.`)
    }

}

const patchUser = async (req, res) => {
    const { name, surname, email, password, dni, edificio, piso, puerta, role } = req.body
    await User.findByIdAndUpdate(id, {
        name,
        surname,
        email,
        password,
        dni,
        edificio,
        piso,
        puerta,
        role
    })
    res.status(200).send(`Se actualizo el usuario con éxito.`)
};

const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (user) {
            if (password === user.password) {
            const token = jwt.sign({ user }, claveToken, { expiresIn: "1h" })
            return res.status(200).json({ user, token })
            } else {
            return res.status(206).json({ message: "Datos incorrectos." })
            }
        } else {
            return res.status(206).json({ message: "Datos incorrectos." })
        }
    } catch (error) {
      console.error(error)
      return res.status(206).json({ message: "Ha ocurrido un error inesperado" })
    }
  }

const emailUser = async (req, res) => {
    const { email } = req.body

    try{
        const user = await User.findOne({"email": email})
        if (user) {
            if (user.role === 'admin' || user.role === 'gold') {
              res.status(206).send({ message: 'Usuario no encontrado' })
            } else {
              res.status(200).send(user)
            }
          } else {
            res.status(206).send({ message: 'Usuario no encontrado' })
          }
    }
    catch(error){
        console.error(error);
    }
};

const restablecerContraseña = async (req, res) => {
    const { id, password  } = req.body
    await User.findByIdAndUpdate(id, {
        password
    })
    res.status(200).send(`Se actualizo su contraseña con éxito.`)
};

module.exports = { crearUser, getUser, deleteUser, patchUser, getUserEspecifico, loginUser, emailUser, restablecerContraseña }