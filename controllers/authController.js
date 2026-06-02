const authService = require("../services/authService")

exports.register = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password)
        return res.status(400).json({
            success: false,
            message: "Name, email, dan password wajib diisi"
        })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email))
        return res.status(400).json({
            success: false,
            message: "Format email tidak valid"
        })

    if (password.length < 6)
        return res.status(400).json({
            success: false,
            message: "Password minimal 6 karakter"
        })

    try {
        const user = await authService.register({ name, email, password })
        res.status(201).json({
            success: true,
            message: "Register berhasil",
            data: user
        })
    } catch (err) {
        if (err.code === "P2002") return res.status(400).json({
            success: false,
            message: "Email sudah terdaftar"
        })
        res.status(500).json({
            success: false,
            message: err.message || "Terjadi kesalahan pada server"
        })
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        return res.status(400).json({
            success: false,
            message: "Email dan password wajib diisi"
        })

    try {
        const result = await authService.login({ email, password })
        return res.status(200).json({
            success: true,
            message: "Login berhasil",
            data: result
        })
    } catch (err) {
        const status = err.statusCode || 500
        res.status(status).json({
            success: false,
            message: err.message || "Terjadi kesalahan pada server"
        })
    }
}

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken)
        return res.status(400).json({
            success: false,
            message: "Refresh token wajib diisi"
        })

    try {
        const result = await authService.refresh(refreshToken)
        return res.status(200).json({
            success: true,
            message: "Refresh token berhasil",
            data: result
        })
    } catch (err) {
        const status = err.statusCode || 500
        res.status(status).json({
            success: false,
            message: err.message || "Terjadi kesalahan pada server"
        })
    }
}

exports.logout = async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken)
        return res.status(400).json({
            success: false,
            message: "Refresh token wajib diisi"
        })

    try {
        await authService.logout(refreshToken)
        return res.status(200).json({
            success: true,
            message: "Logout berhasil"
        })
    } catch (err) {
        const status = err.statusCode || 500
        return res.status(status).json({
            success: false,
            message: err.message || "Terjadi kesalahan pada server"
        })
    }
}
