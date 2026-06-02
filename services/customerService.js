const prisma = require("../config/prisma")

const getAllCustomers = async ({ name, jenisKelamin, page, limit, sortBy, order }) => {
    const where = {}

    if (name) where.name = { contains: name, mode: "insensitive" }
    if (jenisKelamin) where.jenisKelamin = jenisKelamin

    const skip = (page - 1) * limit

    const [customers, total] = await prisma.$transaction([
        prisma.customer.findMany({
            where,
            orderBy: { [sortBy]: order },
            skip,
            take: limit
        }),
        prisma.customer.count({ where })
    ])

    return {
        customers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    }
}

const createCustomer = async ({ name, email, phone, address, umur, jenisKelamin, aktifLangganan }) => {
    return await prisma.customer.create({
        data: { name, email, phone, address, umur, jenisKelamin, aktifLangganan }
    })
}

const updateCustomer = async (id, { name, email, phone, address, umur, jenisKelamin, aktifLangganan }) => {
    return await prisma.customer.update({
        where: { id },
        data: { name, email, phone, address, umur, jenisKelamin, aktifLangganan }
    })
}

const deleteCustomer = async (id) => {
    return await prisma.customer.delete({
        where: { id }
    })
}

module.exports = { getAllCustomers, createCustomer, updateCustomer, deleteCustomer }
