const express = require("express");
const userRoute = express.Router();
const mongoose = require('mongoose');
const userSchema = require('../schema/userSchema')
const bcrypt = require("bcryptjs");
mongoose.connect("mongodb+srv://mobashir:mobashir123@cluster0.sv5dvda.mongodb.net/Padmini_Task?retryWrites=true&w=majority")
    .then(() => {
        console.log("connected with mongodb");
    })
    .catch((err) => {
        console.log(err);
    });


// signup
const userModel = new mongoose.model("User", userSchema)
userRoute.post("/signup", async (req, res) => {

    const bodyData = req.body;
    const name = bodyData.name;
    const email = bodyData.email;
    const password = bodyData.password;
    console.log(name, email, password);

    const output = await userModel.create({
        name, email, password
    });
    const token = output.getJwtToken();
    output.token = token;
    await output.save();

    res.status(200).json({
        success: true,
        message: "User Register Successfully",
        "token": token,
        output
    })
})

//login routes
userRoute.post('/login', async (req, res) => {
    const bodyData = req.body;
    const email = bodyData.email;
    const password = bodyData.password;
    const userData = await userModel.findOne({ email: email });
    console.log(userData);
    let token = userData.getJwtToken();
    if (!userData) {
        return res.json({ status: 200, message: "User Not Exist Please Register First", "key": 0, "token": null })
    } else {
        const result2 = await bcrypt.compare(password, userData.password);
        if (result2) {
            console.log("match");
            userData.token = token;
            await userData.save();
            return res.json({ status: 200, message: "User Successfully Login", "key": 1, "token": token })
        } else {
            return res.json({ status: 200, message: "Email Id Or Password Did Not Match", "key": 0, "token": null })
        }

    }
})

// create post
userRoute.post('/create_post', async (req, res) => {
    const bodyData = req.body;
    const token = bodyData.token;
    const postContent = bodyData.postContent;
    const postImg = bodyData.postImg;
    const user = await userModel.findOne({ token });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. User not found.",
        });
    }

    user.post.push({ postContent, postImg });
    const newPost = await user.save();

    res.status(200).json({
        success: true,
        message: "Post created successfully",
        post: newPost,
    });
});

// edit post
userRoute.put('/edit_post', async (req, res) => {
    const bodyData = req.body;
    const token = bodyData.token;
    const postId = bodyData.postId;
    const updatedPostContent = bodyData.updatedPostContent;
    const updatedPostImg = bodyData.updatedPostImg;
    const user = await userModel.findOne({ token });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. User not found.",
        });
    }

    const postIndex = user.post.findIndex((post) => post._id.toString() === postId);
    if (postIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Post not found.",
        });
    }

    user.post[postIndex].postContent = updatedPostContent;
    user.post[postIndex].postImg = updatedPostImg;

    const updatedUser = await user.save();

    res.status(200).json({
        success: true,
        message: "Post updated successfully",
        updatedPost: updatedUser.post[postIndex],
    });
});

// delete post
userRoute.delete('/delete_post', async (req, res) => {
    try {
        const token = req.body.token;
        const postId = req.body.postId;

        const user = await userModel.findOne({ token });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User not found.",
            });
        }

        const postIndex = user.post.findIndex((post) => post._id.toString() === postId);

        if (postIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Post not found.",
            });
        }

        user.post.splice(postIndex, 1);

        const deletedPost = await user.save();

        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
            deletedPost,
        });
    } catch (error) {
        console.error("Error in delete_post route:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});

// get all post 
userRoute.get('/get_posts', async (req, res) => {
    const token = req.query.token;
    // console.log(token)
    const user = await userModel.findOne({ token });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. User not found.",
        });
    }
    const allPosts = user.post;
    res.status(200).json({
        success: true,
        allPosts,
    });
});

module.exports = userRoute;