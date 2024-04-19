const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;



module.exports = {
    register: async (req, res, next) => {
        try {
            let { name, email, password } = req.body

            let exist = await prisma.user.findUnique({ where: { email } })

            if (exist) {
                return res.status(400).json({
                    status: false,
                    message: 'email already used',
                    data: null
                })
            }

            let encryptedPassword = await bcrypt.hash(password, 10)

            let user = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password: encryptedPassword
                }
            })

            return res.status(201).json({
                status: true,
                message: 'Registered success',
                data: { user }
            })

        } catch (err) {
            next(err)
        }
    },

    login: async (req, res, next) => {
        try {
            let { email, password } = req.body

            let user = await prisma.user.findUnique({ where: { email } })

            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'invalid email or password',
                    data: null
                })
            }

            let isPasswordCorrect = await bcrypt.compare(password, user.password)

            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: 'invalid email or password',
                    data: null
                })
            }

            let token = jwt.sign(user, JWT_SECRET_KEY)

            return res.status(200).json({
                status: false,
                message: 'User logged in success',
                data: { user, token }
            })

        } catch (err) {
            next(err)
        }
    },

    authenticate: (req, res) => {
        return res.status(200).json({
            status: true,
            message: 'OK',
            data: {
                user: req.user
            }
        })
    }
}