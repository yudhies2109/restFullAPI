const prisma = require("../config/prisma")
const bcrypt = require("bcrypt")
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require("../utils/jwt")

const register = async ({ name, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10)
    return await prisma.user.create({
        data: { name, email, password: hashedPassword },
        select: { id: true, name: true, email: true, createdAt: true }
    })
}

const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        const error = new Error("User tidak ditemukan")
        error.statusCode = 400
        throw error
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        const error = new Error("Password salah")
        error.statusCode = 401
        throw error
    }

    // Hapus token expired milik user ini sebelum buat token baru
    await prisma.refreshToken.deleteMany({
        where: {
            userId: user.id,
            expiresAt: { lt: new Date() }
        }
    })

    const accessToken  = generateAccessToken({ id: user.id, name: user.name, email: user.email })
    const refreshToken = generateRefreshToken({ id: user.id })

    // Hash refresh token sebelum disimpan ke DB
    const hashedToken = await bcrypt.hash(refreshToken, 10)

    await prisma.refreshToken.create({
        data: {
            token: hashedToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    })

    console.log("=== USER LOGIN ===")
    console.log("All User            :", user)
    console.log("ID            :", user.id)
    console.log("Name          :", user.name)
    console.log("Email         :", user.email)
    console.log("Access Token  :", accessToken)
    console.log("Refresh Token :", refreshToken)
    console.log("==================")

    return { accessToken, refreshToken, name: user.name, email: user.email }
}

const refresh = async (refreshToken) => {
    // Verify signature dulu sebelum cek DB
    let payload
    try {
        payload = verifyRefreshToken(refreshToken)
    } catch (err) {
        const error = new Error("Refresh token tidak valid atau expired")
        error.statusCode = 401
        throw error
    }

    // Ambil semua token milik user yang belum expired dan belum di-revoke
    const storedTokens = await prisma.refreshToken.findMany({
        where: {
            userId: payload.id,
            expiresAt: { gt: new Date() },
            revokedAt: null
        }
    })

    // Bandingkan dengan bcrypt karena token di DB sudah di-hash
    let matchedToken = null
    for (const stored of storedTokens) {
        const isMatch = await bcrypt.compare(refreshToken, stored.token)
        if (isMatch) {
            matchedToken = stored
            break
        }
    }

    if (!matchedToken) {
        const error = new Error("Refresh token tidak ditemukan atau sudah di-revoke")
        error.statusCode = 401
        throw error
    }

    // Generate access token baru
    const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, name: true, email: true }
    })

    const accessToken = generateAccessToken({ id: user.id, name: user.name, email: user.email })

    return { accessToken }
}

const logout = async (refreshToken) => {
    // Verify signature dulu
    let payload
    try {
        payload = verifyRefreshToken(refreshToken)
    } catch (err) {
        const error = new Error("Refresh token tidak valid")
        error.statusCode = 401
        throw error
    }

    // Ambil semua token milik user yang belum di-revoke
    const storedTokens = await prisma.refreshToken.findMany({
        where: {
            userId: payload.id,
            revokedAt: null
        }
    })

    // Cari token yang cocok lalu soft delete dengan set revokedAt
    for (const stored of storedTokens) {
        const isMatch = await bcrypt.compare(refreshToken, stored.token)
        if (isMatch) {
            await prisma.refreshToken.update({
                where: { id: stored.id },
                data: { revokedAt: new Date() }
            })
            break
        }
    }
}

const getProfile = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, createdAt: true }
    })

    if (!user) {
        const error = new Error("User tidak ditemukan")
        error.statusCode = 404
        throw error
    }

    return user
}

module.exports = { register, login, refresh, logout, getProfile }
