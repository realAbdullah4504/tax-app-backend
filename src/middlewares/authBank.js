const AppError = require('../errors/AppError');

const authenticateBank = async (req, res, next) => {
    try {
        const accessToken = req.header('AuthorizationBank')
        if (!accessToken) throw new AppError('Access token missing', 401);

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            // 'Content-Type': 'application/json',
            // 'Accept': 'application/json',
        };
        req.headers = headers;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authenticateBank,
};
