const customerService = require("../services/customerService")

// PUBLIC
exports.getAllCustomers = async (req, res) => {
    const name         = req.query.name || undefined
    const jenisKelamin = req.query.jenisKelamin?.toUpperCase().replace("-", "_") || undefined
    const page         = parseInt(req.query.page) || 1
    const limit        = parseInt(req.query.limit) || 5
    const sortBy       = req.query.sortBy || "createdAt"
    const order        = req.query.order?.toLowerCase() === "asc" ? "asc" : "desc"

    const allowedSortBy = ["name", "email", "umur", "createdAt", "aktifLangganan"]
    if (!allowedSortBy.includes(sortBy))
        return res.status(400).json({ success: false, message: "Field sortBy tidak valid" })

    try {
        const result = await customerService.getAllCustomers({ name, jenisKelamin, page, limit, sortBy, order })

        return res.status(200).json({
            success: true,
            message: result.customers.length ? "Data customer berhasil diambil" : "Data customer kosong",
            data: result.customers,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        })
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Terjadi kesalahan pada server"
        })
    }
}

// PRIVATE
exports.createCustomer = async (req, res) => {
    const { name, email, phone, address, umur, aktifLangganan } = req.body
    const jenisKelamin = req.body.jenisKelamin?.toUpperCase().replace("-", "_")

    if (!name || !email)
        return res.status(400).json({ success: false, message: "Name dan email wajib diisi" })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email))
        return res.status(400).json({ success: false, message: "Format email tidak valid" })

    if (umur !== undefined && (!Number.isInteger(umur) || umur < 0 || umur > 120))
        return res.status(400).json({ success: false, message: "Umur tidak valid (0-120)" })

    if (jenisKelamin !== undefined && !["LAKI_LAKI", "PEREMPUAN"].includes(jenisKelamin))
        return res.status(400).json({ success: false, message: "Jenis kelamin harus laki_laki atau perempuan" })

    if (aktifLangganan !== undefined && isNaN(Date.parse(aktifLangganan)))
        return res.status(400).json({ success: false, message: "Format tanggal aktif langganan tidak valid" })

    try {
        const customer = await customerService.createCustomer({
            name, email, phone, address, umur, jenisKelamin,
            aktifLangganan: aktifLangganan ? new Date(aktifLangganan) : undefined
        })

        return res.status(201).json({
            success: true,
            message: "Customer berhasil dibuat",
            data: customer
        })
    } catch (err) {
        if (err.code === "P2002")
            return res.status(409).json({ success: false, message: "Email customer sudah terdaftar" })

        return res.status(500).json({ success: false, message: err.message || "Internal server error" })
    }
}

// PRIVATE
exports.updateCustomer = async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "ID tidak valid"
        })
    }

    const { name, email, phone, address, umur, aktifLangganan } = req.body
    const jenisKelamin = req.body.jenisKelamin?.toUpperCase().replace("-", "_")

    // minimal 1 field harus diisi
    if (!name && !email && !phone && !address && umur === undefined && !jenisKelamin && !aktifLangganan)
        return res.status(400).json({ success: false, message: "Minimal satu field harus diisi" })

    // validasi email (opsional, hanya jika dikirim)
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email))
            return res.status(400).json({ success: false, message: "Format email tidak valid" })
    }

    if (umur !== undefined && (!Number.isInteger(umur) || umur < 0 || umur > 120))
        return res.status(400).json({ success: false, message: "Umur tidak valid (0-120)" })

    if (jenisKelamin !== undefined && !["LAKI_LAKI", "PEREMPUAN"].includes(jenisKelamin))
        return res.status(400).json({ success: false, message: "Jenis kelamin harus laki_laki atau perempuan" })

    if (aktifLangganan !== undefined && isNaN(Date.parse(aktifLangganan)))
        return res.status(400).json({ success: false, message: "Format tanggal aktif langganan tidak valid" })

    try {
        const customer = await customerService.updateCustomer(id, {
            name, email, phone, address, umur, jenisKelamin,
            aktifLangganan: aktifLangganan ? new Date(aktifLangganan) : undefined
        })

        return res.status(200).json({
            success: true,
            message: "Customer berhasil diupdate",
            data: customer
        })

    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Customer tidak ditemukan"
            })
        }

        if (err.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Email customer sudah terdaftar"
            })
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

// PRIVATE
exports.deleteCustomer = async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "ID tidak valid"
        })
    }

    try {
        await customerService.deleteCustomer(id)

        return res.status(200).json({
            success: true,
            message: "Customer berhasil dihapus"
        })
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Customer tidak ditemukan"
            })
        }

        console.error("Delete Customer Error:", err)

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        })
    }
}
