const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrpyt = require('bcrypt')
//const { Get } = require('mongoose')

// @desc Get all users
// @route Get /users
// @access Private

const getAllUsers = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
})

// @desc Create all users
// @route Post /users
// @access Private

const createnewUser = asyncHandler(async (req, res) => {
    const { username, password, roles} = req.body

    // confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields required'})
    }
    // check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()
    if (duplicate) {
        return res.status(409).json({message: 'Duplicate username'})
    }

    // hash password
    const hashedPwd = await bcrpyt.hash(password, 10) // 10 salt rounds
    const userObject = { username, 'password' : hashedPwd , roles }

    // create and store new user
    const user = await User.create(userObject)
    
    if (user) {//created
        res.status(201).json({message: `New user ${username} created`})
    }
    else{
        res.status(400).json({message: 'invalid user data recieved'})
    }

})

// @desc Update a users
// @route Patch /users
// @access Private

const updateUser = asyncHandler(async (req, res) => {
    const { id, username, active, password, roles} = req.body

    // confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({message: 'All fields are required'})
    }

    const user = await User.findById(id).exec()
    
    if (!user){
        return res.status(400).json({message: 'User not found'})
    }

    // Check for duplicates
    const duplicate = await User.findOne({ username}).lean().exec()
    // Allow duplicate to the original user
    if (duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate username'})
    }

    user.username = username
    user.roles = roles
    user.active = active
    
    if (password){
        //hash password 
        user.password = await bcrpyt.hash(password,10) //salt rounds 
    }

    const updatedUser = await user.save()
    res.json({message: `${updatedUser.username} Updated`})
})
// @desc Delete a users
// @route Delete /users
// @access Private

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    if (!id){
         return res.status(409).json({message: 'User ID Required'})
    }
    const note = await Note.findOne({user: id}).lean().exec()
    if (note){
        return res.status(400).json({message: 'User has assigned notes'})
    }
    
    const user = await User.findById(id).exec()
    if (!user){
        return res.status(400).json({message: 'User not found'})
    }
    await user.deleteOne()

    const reply = `Username ${user.username} with ID ${user._id} deleted`

    res.json(reply)
    
})

module.exports = {
    getAllUsers,
    createnewUser,
    updateUser,
    deleteUser
}