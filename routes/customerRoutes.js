const router = require("express").Router()
const customerController = require("../controllers/customerController")
const authMiddleware = require("../middleware/authMiddleware")

// PUBLIC - Tidak perlu token
router.get("/", customerController.getAllCustomers)

// PRIVATE - Wajib token JWT
router.post("/", authMiddleware, customerController.createCustomer)
router.put("/:id", authMiddleware, customerController.updateCustomer)
router.delete("/:id", authMiddleware, customerController.deleteCustomer)

module.exports = router
