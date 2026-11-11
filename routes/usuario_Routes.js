const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario_Controller');

// Definición de Endpoints para /api/usuarios
router.post('/', usuarioController.crearUsuario);
// IMPORTANTE: '/buscar' debe ir ANTES de '/:id', si no Express lo tomaría como un ID
router.get('/buscar', usuarioController.buscarUsuarioPorCorreo);
router.get('/:id', usuarioController.obtenerUsuarioPorId);

module.exports = router;    