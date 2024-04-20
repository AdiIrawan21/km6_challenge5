const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt")


module.exports = {
    // function untuk create data users
    create: async (req, res, next) => {
        try {
            const { name, email, password, identity_type, identity_number, address } = req.body;

            // Cek apakah email sudah terdaftar
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                },
            });

            if (existingUser) {
                return res.status(400).json({
                    status: false,
                    message: 'Email is already in use',
                    data: null,
                });
            }

            // Validasi data jika tidak diisi
            if (!name || !email || !password || !identity_type || !identity_number || !address) {
                return res.status(400).json({
                    status: false,
                    message: `'Name', 'Email', 'Password', 'Identity Type', 'Identity Number', 'Address' are required`,
                    data: null,
                });
            }

            let encryptedPassword = await bcrypt.hash(password, 10)
            // Create data user beserta profile
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: encryptedPassword,
                    profile: {
                        create: {
                            identity_type,
                            identity_number,
                            address,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
            delete newUser.password

            return res.status(201).json({
                status: true,
                message: 'User successfully created',
                data: newUser,
            });
        } catch (error) {
            next(error);
        }
    },


    // function untuk menampilkan data users
    index: async (req, res, next) => {
        try {

            let { search } = req.query;

            let users = await prisma.user.findMany({ where: { name: { contains: search } } });

            // cek apakah users ada/tidak
            if (!users) {
                return res.status(404).json({
                    status: false,
                    message: 'No users found',
                    data: []
                });
            }
            delete users.password

            res.status(200).json({
                status: true,
                message: 'OK',
                data: users
            })
        } catch (err) {
            next(err);
        }
    },

    // function untuk menampilkan detail users by id beserta dengan profile
    show: async (req, res, next) => {
        try {

            let id = req.params.id;

            // cek id users 
            let existingUsers = await prisma.user.findUnique({
                where: {
                    id: parseInt(id)
                },
            });

            if (!existingUsers) {
                return res.status(404).json({
                    status: false,
                    message: "Users not found",
                    data: null
                });
            }

            let users = await prisma.user.findUnique({
                where: {
                    id: parseInt(id)
                },
                include: {
                    profile: true
                }
            });
            delete users.password

            res.status(200).json({
                status: true,
                message: 'OK',
                data: users,
            })

        } catch (err) {
            next(err);
        }
    },

    // function untuk update data users
    edit: async (req, res, next) => {
        try {
            let id = req.params.id;
            let { name, email, password, identity_type, identity_number, address } = req.body;

            // cek id users
            let existingUsers = await prisma.user.findUnique({
                where: {
                    id: parseInt(id)
                },
            });

            if (!existingUsers) {
                return res.status(404).json({
                    status: false,
                    message: "Users not found",
                    data: null
                });
            }

            // validasi untuk update data
            if (!name || !email || !password || !identity_type || !identity_number || !address) {
                return res.status(400).json({
                    status: false,
                    message: `'field name', 'email', 'password', 'identity_type', 'address' are required`,
                    data: null
                })
            }
            let encryptedPassword = await bcrypt.hash(password, 10)
            // update data
            let updateUsers = await prisma.user.update({
                where: {
                    id: parseInt(id)
                },

                data: {
                    name,
                    email,
                    password: encryptedPassword,
                    profile: {
                        update: {
                            identity_type,
                            identity_number,
                            address
                        }
                    }
                },
                include: {
                    profile: true,
                }
            })
            delete updateUsers.password
            res.status(200).json({
                status: true,
                message: 'Update Data Successfully',
                data: updateUsers
            })

        } catch (err) {
            next(err);
        }
    },

    // function untuk delete data users by id
    destroy: async (req, res, next) => {
        try {

            let id = parseInt(req.params.id);

            const existingUsers = await prisma.user.findUnique({
                where: { id },
            });

            if (!existingUsers) {
                return res.status(404).json({
                    status: false,
                    message: `Users not found`,
                    data: null,
                });
            }

            // cek apakah users memiliki bank account
            let usersAccount = await prisma.bankAccounts.findMany({ where: { users_id: id } })

            if (usersAccount.length > 0) {
                let isTransactions = await prisma.transaction.findMany({
                    where: {
                        OR: [
                            { source_account_id: { in: usersAccount.map(bankAccounts => bankAccounts.id) } },
                            { destination_account_id: { in: usersAccount.map(bankAccounts => bankAccounts.id) } }
                        ]
                    }
                })

                if (isTransactions.length > 0) {
                    await prisma.transaction.deleteMany({
                        where: {
                            OR: [
                                { source_account_id: { in: usersAccount.map(bankAccounts => bankAccounts.id) } },
                                { destination_account_id: { in: usersAccount.map(bankAccounts => bankAccounts.id) } }
                            ]
                        }
                    })
                }
            }



            await prisma.bankAccounts.deleteMany({
                where: { users_id: id }
            })

            await prisma.profile.deleteMany({
                where: { users_id: id }
            })

            await prisma.user.delete({
                where: { id }
            })

            res.status(200).json({
                status: true,
                message: 'Users deleted successfully',
                data: null
            })
        } catch (error) {
            next(error);
        }
    }
}