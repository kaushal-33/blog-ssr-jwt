const express = require("express");
const { getLogin, getSignUp, signUpUser, loginUser, logOut, getProfile, getForgotPage, forgotPassword, resetPass } = require("../controllers/authController.js");
const { isLogin } = require("../middleware/protectedRoute.js");
const router = express.Router();

router.get("/", getLogin);
router.get("/sign-up", getSignUp);
router.get("/profile", isLogin, getProfile)
router.post("/sign-up", signUpUser);
router.post("/", loginUser);
router.post("/log-out", logOut)
router.get("/forgot", getForgotPage)
router.post("/forgot", forgotPassword)
router.post("/reset-password", resetPass)
module.exports = router;