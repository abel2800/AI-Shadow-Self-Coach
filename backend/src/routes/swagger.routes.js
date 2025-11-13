/**
 * Swagger Documentation Routes
 * Serves API documentation
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Shadow Coach API Documentation',
  customfavIcon: '/favicon.ico'
}));

// JSON spec
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;

