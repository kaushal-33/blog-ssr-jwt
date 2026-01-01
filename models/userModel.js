const { name } = require("ejs");
const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    userEmail: {
        type: String,
        required: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        unique: true,
        lowercase: true,
    },
    userPassword: {
        type: String,
        required: true,
        minlength: 3,
    },
})

const UserModel = mongoose.model("UserModel", userSchema);
module.exports = UserModel;