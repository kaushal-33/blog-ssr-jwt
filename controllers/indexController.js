const BlogModel = require("../models/blogModel.js");
const fs = require("fs");
const path = require("path");
const UserModel = require("../models/userModel.js");
const bcrypt = require("bcrypt");
exports.home = async (req, res) => {
    try {
        const data = await BlogModel.find({}).populate("blogAuthor", "userName");
        console.log(data)
        res.render("allBlogs", { blogs: data });
    } catch (error) {
        console.log(error)
    }
}

exports.blogForm = (req, res) => {
    res.render("blogForm");
}

exports.addBlog = async (req, res) => {
    try {
        // console.log(req.userData)
        const { userID } = req.userData;
        const { path } = req.file;

        await BlogModel.create({
            ...req.body,
            blogImage: path,
            blogAuthor: userID
        })

        res.redirect("/");
    } catch (error) {
        console.log(error)
    }

}

exports.deleteBlog = async (req, res) => {
    try {
        let { id } = req.params;
        let data = await BlogModel.findById(id);
        // console.log(data);
        let imgPath = path.join(__dirname, "..", data?.blogImage);
        fs.unlink(imgPath, err => err && console.log(err));
        await BlogModel.findByIdAndDelete(id);
        res.redirect("/");
    } catch (error) {
        console.log(error)
    }
}

exports.editForm = async (req, res) => {
    try {
        let { id } = req.params;
        let data = await BlogModel.findById(id);
        res.render("editForm", { data });
    } catch (error) {
        console.log(error);
    }
}

exports.editBlog = async (req, res) => {
    try {
        let { id } = req.params;
        let updatedData = req.body;
        if (req.file) {
            let data = await BlogModel.findById(id);
            let imgPath = path.join(__dirname, "..", data?.blogImage);
            fs.unlink(imgPath, err => err && console.log(err));

            updatedData.blogImage = req.file.path;
        }
        await BlogModel.findByIdAndUpdate(id, updatedData);
        res.redirect("/");
    } catch (error) {
        console.log(error)
    }
}

exports.quickView = async (req, res) => {
    try {
        let { id } = req.params;
        let { userID } = req.userData;
        const blog = await BlogModel.findById(id).lean();
        blog.userId = userID;
        // console.log(blog)
        res.render("quickView", { blog });
    } catch (error) {
        console.log(error)
    }
}

exports.getMyBlogs = async (req, res) => {
    try {
        const { userID } = req.userData;
        const myBlogs = await BlogModel.find({ blogAuthor: userID });
        // console.log(myBlogs);

        return res.render("myBlogs", { myBlogs });
    } catch (error) {
        console.log(error.message);
    }
}

exports.changePassPage = (req, res) => {
    res.render("changePass");
}

exports.changePass = async (req, res) => {
    try {
        const { userID } = req.userData;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.send('New password and Confirm password must be same....!');
        }
        const user = await UserModel.findOne({ _id: userID });
        // console.log(user)
        const isValidPass = await bcrypt.compare(currentPassword, user.userPassword);
        // console.log(isValidPass);
        if (isValidPass) {
            const newHashedPass = await bcrypt.hash(confirmPassword, 10);
            user.userPassword = newHashedPass;
            await user.save();
            res.clearCookie("accessToken");
            return res.redirect("/auth");
        } else {
            res.send("Current password is incorrect...!");
        }

    } catch (error) {
        console.log(error.message);
    }
}