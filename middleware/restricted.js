const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({
            status: false,
            message: "You're not authorized!",
            data: null
        });
    }

    jwt.verify(authorization, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                message: "You're not authorized!",
                err: err.message,
                data: null
            });
        }

        req.user = decoded;
        next();
    });
};
