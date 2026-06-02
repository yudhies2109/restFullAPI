const router = require("express").Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const authService = require("../services/authService")

router.post("/register", authController.register)
router.post("/login",    authController.login)
router.post("/refresh",  authController.refresh)
router.post("/logout",   authController.logout)

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await authService.getProfile(req.user.id)
        res.json(user)
    } catch (err) {
        const status = err.statusCode || 500
        res.status(status).json(err.message)
    }
})

module.exports = router
