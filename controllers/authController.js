const UserModel = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlogModel = require("../models/blogModel.js");
const nodemailer = require("nodemailer");

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
    const blogCount = await BlogModel.find({ blogAuthor: userID })
    // console.log(user);
    user.blogCount = blogCount.length;
    res.render("profile", { user });

  } catch (error) {
    console.log(error)
  }
}

exports.getForgotPage = (req, res) => {
  res.render("forgotPage");
}
exports.forgotPassword = async (req, res) => {
  const { userEmail } = req.body;
  try {
    const user = await UserModel.findOne({ userEmail }).select("-userPassword");
    if (user) {
      const OTP = parseInt(100000 + Math.random() * 90000).toString();
      // console.log(OTP);
      const hashedOtp = await bcrypt.hash(OTP, 10);
      // console.log(hashedOtp)

      user.forgotOtp = hashedOtp;
      user.otpExp = Date.now() + 10 * 60 * 1000;
      await user.save();

      (async () => {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASS,
          }
        })
        await transporter.sendMail({
          from: `"Blogster"`,
          to: userEmail,
          subject: "Your OTP for Password Reset",
          html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>OTP Verification</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f9fafb; font-family:Arial, Helvetica, sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding:20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:8px; padding:30px;">

                <!-- Logo -->
                <tr>
                  <td align="center" style="font-size:24px; font-weight:bold; color:#3798a6; padding-bottom:20px;">
                    Blogster
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td align="center" style="font-size:14px; color:#4b5563; padding-bottom:10px;">
                    Use the OTP below to reset your password.
                  </td>
                </tr>

                <!-- OTP -->
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <span style="display:inline-block; font-size:32px; letter-spacing:6px; font-weight:bold; color:#111827; background-color:#f3f4f6; padding:12px 20px; border-radius:6px;">
                      ${OTP}
                    </span>
                  </td>
                </tr>

                <!-- Info -->
                <tr>
                  <td align="center" style="font-size:14px; color:#4b5563; padding-bottom:20px;">
                    This OTP is valid for <strong>10 minutes</strong>.<br />
                    Please do not share it with anyone.
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="font-size:12px; color:#9ca3af; padding-top:20px; border-top:1px solid #e5e7eb;">
                    If you didn’t request a password reset, you can safely ignore this email.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
      `,
        });

      })()

      res.render("resetPass", { userEmail });
    } else {
      res.send("No user found with this email...!");
    }
  } catch (error) {
    console.log(error.message);
  }
}

exports.resetPass = async (req, res) => {
  try {
    const { userEmail, otp, newPassword } = req.body;
    const user = await UserModel.findOne({ userEmail }).select("-userPassword");
    const isValidOtp = await bcrypt.compare(otp, user.forgotOtp);

    if (!isValidOtp || Date.now() > user.otpExp || !user.forgotOtp) {
      res.send("Incorrect or Expired OTP...!");
    }

    const newHashedPass = await bcrypt.hash(newPassword, 10);

    user.userPassword = newHashedPass;
    user.forgotOtp = null;
    user.otpExp = null;

    await user.save();

    res.redirect("/auth");
  } catch (error) {
    console.log(error.message);
  }
}