const User = require('../model/users');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
require('dotenv').config();
const claveToken = process.env.CLAVE;
const moment = require('moment');

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
    const { name, surname, email, password, dni, edificio, piso, puerta, tipo, baulera } = req.body;
    const role = 'usuario'
    const date = 'Sin archivo'
    const userExistentesEmail = await User.findOne({"email": email})
    if (userExistentesEmail){
        res.status(206).send(`Este correo electrónico ya esta en uso`)
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
            tipo,
            baulera,
            date,
            dateComprobante: date,
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

const updateDate = async (req, res) => {
  const { id, tipo } = req.body
  if(id){
  const date = new Date();
  if(tipo === "recibo"){
    await User.findByIdAndUpdate(id, {
      date: date.toLocaleDateString('es-ES'),
    })
    res.status(200).send(`Se actualizo la fecha con éxito.`)
  } else {
    await User.findByIdAndUpdate(id, {
      dateComprobante: date.toLocaleDateString('es-ES'),
    })
    res.status(200).send(`Se actualizo la fecha con éxito.`)
  }} else{
  res.status(206).send(`No id.`)
  }
};

const patchUser = async (req, res) => {
    const { id, name, surname, email, password, dni, piso, puerta, tipo, baulera } = req.body
    await User.findByIdAndUpdate(id, {
        name,
        surname,
        email,
        password,
        dni,
        piso,
        puerta,
        tipo,
        baulera
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

const recoverPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({"email": email})
      if (user) {
            const tokenNormal = jwt.sign({ user }, claveToken, { expiresIn: "1h" })
            const token = Buffer.from(JSON.stringify(tokenNormal)).toString('base64');
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                  user: "serpasoportedev@gmail.com",
                  pass: "rtobebucsdkzixdr",
                },
                tls: {
                    rejectUnauthorized: false
                  }
              });
          
              let info = await transporter.sendMail({
                from: '"Serpa Administración" serpasoportedev@gmail.com',
                to: email,
                subject: "Recuperar contraseña", 
                html: `<p>Ingrese al siguiente link para recuperar su contraseña:</p><a href='https://serpaadministracion.netlify.app/Recuperar-contrase%C3%B1a/${token}'>Click aquí</a>`,
              });
              res.status(200).json("Email sent");
        } else {
            res.status(206).send({ message: 'Usuario no encontrado' })
    }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

const changePassword = async (req, res) => {
    try {
      const { token, password } = req.body;
  
    const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
    const { user } = jwt.verify(decodedToken, claveToken);
    const { _id } = user;
    await User.findByIdAndUpdate(_id, { 
        password 
    });
  
    res.status(200).json('La contraseña se cambio con éxito.');
    } catch (error) {
      console.log(error);
      if (error.name === 'JsonWebTokenError') {
        res.status(400).json({ message: 'El enlace es invalido.' });
      } else if (error.name === 'TokenExpiredError') {
        res.status(400).json({ message: 'El enlace expiró' });
      } else {
        res.status(500).json({ message: 'Error del servidor' });
      }
    }
};

const changePasswordAdmin = async (req, res) => {
    try {
      const { id, password } = req.body;
  
    await User.findByIdAndUpdate(id, { 
        password 
    });
  
    res.status(200).json('La contraseña se cambio con éxito.');
    } catch (error) {
      console.log(error);
      if (error.name === 'JsonWebTokenError') {
        res.status(400).json({ message: 'El enlace es invalido.' });
      } else if (error.name === 'TokenExpiredError') {
        res.status(400).json({ message: 'El enlace expiró' });
      } else {
        res.status(500).json({ message: 'Error del servidor' });
      }
    }
};

module.exports = { crearUser, getUser, deleteUser, patchUser, getUserEspecifico, loginUser, recoverPassword, changePassword, changePasswordAdmin, updateDate }