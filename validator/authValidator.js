const { body } = require("express-validator")
const validateRequest = require("../middleware/validateRequest")

const loginRules = [
    body('username')
    .trim()
    .notEmpty().withMessage('Username wajib di isi')
    .isLength({max:64}).withMessage('Username maksimal 64 karakter'), //selalu sesuaikan dengan user username
    body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({max:128}).withMessage('Password maksimal 128 karakter'),
    validateRequest
]

module.exports = {loginRules}