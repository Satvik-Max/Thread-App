const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require("jsonwebtoken");

mongoose
    .connect("Your_Mongo_DB URL")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error Connecting to MongoDB" , err);
    });

app.listen(port, () => {
    console.log("server is running on port 3000");
});

const User = require("./models/user");
const Post = require("./models/post");
app.get("/", (req, res) => {
    res.send("Hello World");
})
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const newUser = new User({ name, email, password });

        newUser.verificationToken = crypto.randomBytes(20).toString("hex");

        await newUser.save();

        sendVerificationEmail(newUser.email, newUser.verificationToken);

        res.status(200).json({ message: "Registration successful" });
    } catch (error) {
        console.log("error registering user", error);
        res.status(500).json({ message: "error registering user" });
    }
});

const sendVerificationEmail = async (email, verificationToken) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "Your_Email",
            pass: "Your_Pass",
        },
    });

    const mailOptions = {
        from: "threads.com",
        to: email,
        subject: "Email Verification",
        text: `please click the following link to verify your email http://192.168.43.186:3000/verify/${verificationToken}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log("error sending email", error);
    }
};

app.get("/verify/:token", async (req, res) => {
    try {
        const token = req.params.token;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(404).json({ message: "Invalid token" });
        }

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.log("error getting token", error);
        res.status(500).json({ message: "Email verification failed" });
    }
});

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");
    return secretKey;
};

const secretKey = generateSecretKey();

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Invalid email" });
        }

        if (user.password !== password) {
            return res.status(404).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user._id }, secretKey);

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
});

app.get("/user/:userId", (req, res) => {
    try {
        const loggedInUserId = req.params.userId;

        User.find({ _id: { $ne: loggedInUserId } })
            .sort({ joindDate: -1 })
            .then((users) => {
                res.status(200).json(users);
            })
            .catch((error) => {
                console.log("Error: ", error);
                res.status(500).json("errror");
            });
    } catch (error) {
        res.status(500).json({ message: "error getting the users" });
    }
});
app.post("/follow", async (req, res) => {
    const { currentUserId, selectedUserId } = req.body;
    try {
        await User.findByIdAndUpdate(selectedUserId, {
            $push: { followers: currentUserId },
        });

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error in following a user" });
    }
});
app.post("/users/unfollow", async (req, res) => {
    const { loggedInUserId, targetUserId } = req.body;

    try {
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: loggedInUserId },
        });

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error unfollowing user" });
    }
});
app.get("/profile/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Error while getting the profile" });
    }
});
app.post("/create-post", async (req, res) => {
    try {
        const { content, userId } = req.body;

        const newPostData = {
            user: userId,
        };
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }
        if (content) {
            newPostData.content = content;
        }

        const newPost = new Post(newPostData);

        await newPost.save();

        res.status(200).json({ message: "Post saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "post creation failed" });
    }
});

app.put("/posts/:postId/:userId/like", async (req, res) => {
    const postId = req.params.postId;
    const userId = req.params.userId;

    try {
        const post = await Post.findById(postId).populate("user", "name");

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: userId } },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        updatedPost.user = post.user;

        res.json(updatedPost);
    } catch (error) {
        console.error("Error liking post:", error);
        res
            .status(500)
            .json({ message: "An error occurred while liking the post" });
    }
});

app.put("/posts/:postId/:userId/unlike", async (req, res) => {
    const postId = req.params.postId;
    const userId = req.params.userId;

    try {
        const post = await Post.findById(postId).populate("user", "name");

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: userId } },
            { new: true }
        );

        updatedPost.user = post.user;

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(updatedPost);
    } catch (error) {
        console.error("Error unliking post:", error);
        res
            .status(500)
            .json({ message: "An error occurred while unliking the post" });
    }
});

app.get("/get-posts", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res
            .status(500)
            .json({ message: "An error occurred while getting the posts" });
    }
});

app.get("/get-postss/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ user: userId })
            .populate("user", "name")
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while getting the posts" });
    }
});
