const mongoose = require('mongoose')

const UsersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: Number,
    email: String,
    password: String,

})

const UserModel = mongoose.model("users", UsersSchema)
module.exports = UserModel