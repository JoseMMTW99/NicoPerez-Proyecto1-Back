const express = require('express');
const route = express.Router();
const { crearUser, getUser, patchUser, deleteUser, getUserEspecifico, loginUser, recoverPassword, changePassword, changePasswordAdmin } = require('../controllers/users');

route.get('/obtener-users', getUser);
route.get('/:id', getUserEspecifico);
route.post('/crear-user', crearUser)
route.post('/recuperar-password', recoverPassword)
route.post('/recuperar-password-token', changePassword)
route.post('/recuperar-password-admin', changePasswordAdmin)
route.patch(`/editar-user`, patchUser);
route.delete(`/eliminar-user`, deleteUser);
route.post(`/login-user`, loginUser);

module.exports = route;