const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

router.get('/', customersController.getCustomers);
router.post('/', customersController.createCustomer);
router.post('/find-or-create', customersController.findOrCreateCustomer);

module.exports = router;
