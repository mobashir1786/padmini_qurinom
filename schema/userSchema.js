const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, 'please enter Email'],
    },
    password: {
        type: String,
        required: [true, 'please enter your Password']
    },
    username: {
        type: String,
        default: function () {
            return this.name ? this.name.toLowerCase().replace(/\s+/g, '') + '@123' : '';
        }
    },
    post: {
        type: [{
            postContent: {
                type: String,
                required: [true]
            },
            postImg: {
                type: String,
                required: true
            }
        }]
    },
    token: {
        type: String,
        default: ""
    }
});

//to hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// to get jwt token 
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, "USER", {
        expiresIn: "3d"
    })
}

module.exports = userSchema;