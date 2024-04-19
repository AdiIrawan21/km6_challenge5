const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    // function create transaction
    create: async (req, res, next) => {
        try {

            let { source_account_id, destination_account_id, amount } = req.body;

            // validasi data transaction
            if (!source_account_id || !destination_account_id || !amount) {
                return res.status(400).json({
                    status: false,
                    message: `fields 'source_account_id', 'destination_account_id', 'amount' are required`,
                    data: null
                })
            }

            // cek apakah nilai source_account_id dengan destination_account_id itu sama
            if (source_account_id === destination_account_id) {
                res.status(400).json({
                    status: false,
                    message: 'SourceAccountId and DestinationAccountId not the same value!',
                    data: null
                })
            }

            // cek source account
            let sourceAccount = await prisma.bankAccounts.findUnique({
                where: {
                    id: source_account_id
                }
            })

            if (!sourceAccount) {
                res.status(404).json({
                    status: false,
                    message: 'Source account not found',
                    data: null
                })
            }

            // kurangi saldo di sourceAccount, setelah melakukan transaction ke sourceDestination
            let updateBalance = sourceAccount.balance - amount;

            // update saldo di sourceAccount
            let updateAccount = await prisma.bankAccounts.update({
                where: {
                    id: source_account_id,
                },
                data: {
                    balance: updateBalance,
                },
            });

            // menambahkan amount ke balance destinationAccout
            let destinationAccount = await prisma.bankAccounts.findUnique({
                where: {
                    id: destination_account_id
                }
            })

            if (!destinationAccount) {
                res.status(404).json({
                    status: false,
                    message: 'destination accounts not found',
                    data: null
                })
            }

            // tambah saldo ke destinationAccount
            let newSaldo = destinationAccount.balance + amount;

            // update saldo destinationAccount
            let updatedSaldo = await prisma.bankAccounts.update({
                where: {
                    id: destination_account_id,
                },
                data: {
                    balance: newSaldo,
                }
            })

            // create transaction
            let transaction = await prisma.transaction.create({
                data: {
                    source_account_id,
                    destination_account_id,
                    amount
                }
            })

            res.status(201).json({
                status: true,
                message: 'Transactions successfully',
                data: transaction
            })

        } catch (err) {
            next(err);
        }
    },

    // function untuk menampilkan daftar transaksi
    index: async (req, res, next) => {
        try {

            let { search } = req.query;
            let showTransaksi = await prisma.transaction.findMany();

            if (!showTransaksi) {
                res.status(404).json({
                    status: false,
                    message: 'List of transactions not found',
                    data: null
                })
            }

            res.status(200).json({
                status: true,
                message: 'OK',
                data: showTransaksi
            })

        } catch (err) {
            next(err)
        }
    },

    // menampilkan detail transaksi beserta penerima dan pengirim nya
    show: async (req, res, next) => {
        try {
            const { transaction } = req.params;

            // Ambil detail transaksi dari database
            let transactionDetails = await prisma.transaction.findUnique({
                where: {
                    id: parseInt(transaction)
                },
                include: {
                    source_account: {
                        include: {
                            user: true
                        }
                    },
                    destination_account: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if (!transactionDetails) {
                return res.status(404).json({
                    status: false,
                    message: 'Transaction not found',
                    data: null
                });
            }

            res.status(200).json({
                status: true,
                message: 'OK',
                data: transactionDetails
            });
        } catch (err) {
            next(err);
        }
    },

    // function untuk delete data transaction
    destroy: async (req, res, next) => {
        try {

            const { transaction } = req.params;

            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: parseInt(transaction) },
            });

            if (!existingTransaction) {
                return res.status(404).json({
                    status: false,
                    message: `Transactionsnot found`,
                    data: null,
                });
            }

            await prisma.transaction.delete({
                where: { id: parseInt(transaction) },
            });

            res.status(200).json({
                status: true,
                message: `Deleted transactions successfully`,
                data: null,
            });
        } catch (error) {
            next(error);
        }
    },
}