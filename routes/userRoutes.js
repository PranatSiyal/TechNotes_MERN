const express = require('express')
const router = express.Router()
const usersController = require('../Controllers/usersController')

router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createnewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

module.exports = router