const express = require('express');
const router = express.Router();
const { queryAssistant } = require('../controllers/assistantController');

router.post('/query', queryAssistant);

module.exports = router;
