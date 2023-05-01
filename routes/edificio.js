const express = require('express');
const router = express.Router();
const { crearEdificio, getEdificio, deleteEdificio, patchEdificio, getEdificioEspecifico } = require('../controllers/edificio');

router.get('/get-edificio', getEdificio);
router.get('/:id', getEdificioEspecifico);
router.post('/crear-edificio', crearEdificio);
router.delete('/delete-edificio', deleteEdificio);
router.patch('/patch-edificio', patchEdificio);

module.exports = router;