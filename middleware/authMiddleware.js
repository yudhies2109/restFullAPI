const { verifyAccessToken } = require("../utils/jwt")

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json("Token tidak ada")
    }

    const token = authHeader.split(" ")[1]

    try {

        const verified = verifyAccessToken(token)

        req.user = verified
        next()

    } catch (err) {

        res.status(401).json("Token tidak valid atau expired")

    }

}
