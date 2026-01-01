const jwt = require("jsonwebtoken");


exports.isLogin = (req, res, next) => {
    try {
        const { accessToken } = req.cookies;

        if (!accessToken) {
            return res.redirect("/auth");
        }

        const validToken = jwt.verify(accessToken, process.env.SECRET_KEY);
        // console.log(validToken);

        req.userData = validToken;
        next();
    } catch (error) {
        console.log(error.message)
    }
}