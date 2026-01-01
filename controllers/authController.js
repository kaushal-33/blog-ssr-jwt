const UserModel = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getSignUp = (req, res) => {
    res.render("signUp");
}
exports.getLogin = (req, res) => {
    res.render("login");
}

exports.signUpUser = async (req, res) => {
    try {
        const { userPassword, ...rest } = req.body
        const hashedPassword = await bcrypt.hash(userPassword, 10)
        // console.log(hashedPassword)
        await UserModel.create({
            ...rest,
            userPassword: hashedPassword,
        })
        res.redirect("/auth");
    } catch (error) {
        console.log(error)
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { userPassword, userEmail } = req.body;
        const user = await UserModel.findOne({ userEmail });
        // console.log(user);

        if (!user) {
            return res.send("No User found with this email...!");
        }

        const validPassword = await bcrypt.compare(userPassword, user.userPassword);
        // console.log(validPassword);
        if (validPassword) {
            const token = jwt.sign({
                userID: user._id,
                userName: user.userName,
            }, process.env.SECRET_KEY, {
                expiresIn: "1h"
            });

            res.cookie("accessToken", token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            })
        } else {
            return res.send("Invalid Password...!");
        }
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
}

exports.logOut = (req, res) => {
    res.clearCookie("accessToken");
    res.redirect("/auth");
}

exports.getProfile = async (req, res) => {
    try {
        const { userID } = req.userData;
        // console.log(userID);
        const user = await UserModel.findById(userID).select("-userPassword");
        console.log(user);
        res.render("profile", { user });

    } catch (error) {
        console.log(error)
    }
}