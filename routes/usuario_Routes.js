const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario_Controller');

// Definición de Endpoints para /api/usuarios
router.post('/', usuarioController.crearUsuario);
// '/buscar' debe ir antes de '/:id' para que Express no lo confunda con un ID.
router.get('/buscar', usuarioController.buscarUsuarioPorCorreo);
router.get('/:id', usuarioController.obtenerUsuarioPorId);

module.exports = router;