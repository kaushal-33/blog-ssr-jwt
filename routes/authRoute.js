const express = require("express");
const { getLogin, getSignUp, signUpUser, loginUser, logOut, getProfile } = require("../controllers/authController.js");
const { isLogin } = require("../middleware/protectedRoute.js");
const router = express.Router();

router.get("/", getLogin);
router.get("/sign-up", getSignUp);
router.get("/profile", isLogin, getProfile)
router.post("/sign-up", signUpUser);
router.post("/", loginUser);
router.post("/log-out", logOut)
module.exports = router;