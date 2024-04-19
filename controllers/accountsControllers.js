const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    // function untuk menambahkan akun baru ke user yang sudah didaftarkan.
    create: async (req, res, next) => {
        try {
            let { users_id, bank_name, bank_account_number, balance } = req.body;

            // cek users apakah sudah terdaftar atau belum
            let existingUsers = await prisma.user.findUnique({
                where: {
                    id: users_id,
                }
            })

            if (!existingUsers) {
                return res.status(404).json({
                    status: false,
                    message: 'Users not registered',
                    data: null,
                })
            }

            // validasi data accounts
            if (!users_id || !bank_name || !bank_account_number || !balance) {
                return res.status(400).json({
                    status: false,
                    message: `field 'users_id', 'bank_name', 'bank_account_number', 'balance' are required`,
                    data: null
                })
            }

            // cek akun sudah terdaftar atau belum, berdasarkan informasi bank_account_number
            let existingAccount = await prisma.bankAccounts.findFirst({
                where: {
                    bank_account_number: bank_account_number,
                },
            });

            if (existingAccount) {
                return res.status(400).json({
                    status: false,
                    message: "Accounts or accounts number already exists",
                    data: null,
                });
            }

            // create accounts
            let accounts = await prisma.bankAccounts.create({
                data: {
                    users_id,
                    bank_name,
                    bank_account_number,
                    balance,
                },
                include: {
                    user: true,
                }
            })

            res.status(201).json({
                status: true,
                message: 'Added Accounts Successfully',
                data: accounts,
            })
        } catch (err) {
            next(err);
        }
    },

    // function menampilkan daftar akun.
    index: async (req, res, next) => {
        try {

            let { search } = req.query;

            let showAccounts = await prisma.bankAccounts.findMany({ where: { bank_name: { contains: search } } })

            res.status(200).json({
                status: true,
                message: 'OK',
                data: showAccounts,
            })

            // cek apakah akun ada atau tidak
            if (!showAccounts) {
                return res.status(404).json({
                    status: false,
                    message: 'List Accounts not found',
                    data: []
                })
            }

        } catch (err) {
            next(err);
        }
    },

    // function menampilkan detail akun
    show: async (req, res, next) => {
        try {
            let { id } = req.params;

            let existingAccount = await prisma.bankAccounts.findUnique({
                where: {
                    id: parseInt(id)
                },
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    }
                }
            });

            if (!existingAccount) {
                return res.status(404).json({
                    status: false,
                    message: 'Accounts not found',
                    data: null
                });
            }

            res.status(200).json({
                status: true,
                message: 'OK',
                data: existingAccount
            });
        } catch (err) {
            next(err);
        }
    },

    // function untuk delete accounts
    destroy: async (req, res, next) => {
        try {

            let { id } = Number(req.params);

            let existingAccount = await prisma.bankAccounts.findUnique({
                where: { id: parseInt(id) }
            })

            if (!existingAccount) {
                return res.status(404).json({
                    status: false,
                    message: 'Accounts not found',
                    data: []
                })
            }

            await prisma.transaction.deleteMany({
                where: {
                    OR: [
                        { source_account_id: id },
                        { destination_account_id: id }
                    ]
                }
            })

            await prisma.bankAccounts.delete({
                where: { id: parseInt(id) }
            })

            res.status(200).json({
                status: true,
                message: 'Deleted accounts succesfully'
            })

        } catch (error) {
            next(error);
        }
    }
}