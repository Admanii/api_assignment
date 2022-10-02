const express = require(`express`)
const { create } = require("../models/userModel")
const router = express.Router()
const createError = require(`http-errors`)
const User = require(`../models/userModel`)
const {authSchema} = require(`../helpers/validation_schema`)
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require(`../helpers/jwtHelper`)
const { verify } = require("jsonwebtoken")
//const bcrypt = require(`bcrypt`)


router.post(`/register`, async (req, res, next) => {
    try {
        const result = await req.body
        if(!result.email || !result.password) throw createError.BadRequest()

        const doesExist = await User.findOne({email: result.email})
        if(doesExist) {throw createError.Conflict(`${result.email} already in use`)
    }else{
        const user = new User(result)
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        const refreshToken = await signRefreshToken(savedUser.id)
        res.send({accessToken, refreshToken})

    }

    } catch (error) {
        next(error)
        
    }
})

// router.post(`/register`, async (req, res, next) => {
//     console.log(req.body)
//     bcrypt.hash(req.body.password, 10, (err, hash) => {
//         if (err) {
//          return res.status(500).json({
//              error: err
//          });
//         } else {
//             const user = new User({
//                 email: req.body.email, 
//                 password: hash    
//             })
//             user
//             .save()
//             .then(res.status(201).json({
//                     message: `User Created`
//                 })
//             )
//             .catch(err => {
//                 console.log(err),
//                 res.status(500).json({
//                     error: err
//                 })
//             })

//         }
//      })
    
//     // try {
        
//     //     const {email, password} = req.body
//     //     // if (!email || !password) throw createError.BadRequest()
//     //     //const result = authSchema.validateAsync(req.body)
//     //     console.log(email, password)



//     //     const doesExist = await User.findOne({email: email})
//     //     if (doesExist) throw createError.Conflict(`${email} already in use`)

//     //     const savedUser = await user.save()
//     //     const accessToken = await signAccessToken(savedUser.id)

//     //     res.send({accessToken})


//     // } catch (error) {
//     //     if (error.isJoi == true) return error.status = 422
//     //     next(error)
//     // }
// })



router.post(`/login`, async (req, res, next) => {
    try{
        const result = req.body
        if(!result.email || !result.password) throw createError.BadRequest("Invalid Username or Password")
        const user = await User.findOne({email: result.email})
        if(!user) throw createError.NotFound("User not registered")

        const isMatch = await user.isValidPassword(result.password)
        if(!isMatch) throw createError.Unauthorized('Username/Password not valid')

        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)

        res.send({accessToken, refreshToken})



    } catch (error) {
        next(error)
    }
})


router.post(`/refresh-token`, async (req, res, next) => {
   try {
    const {refreshToken} = req.body
    if(!refreshToken) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refreshToken)

    const accessToken = await signAccessToken(userId)
    const refToken = await signRefreshToken(userId)
    res.send({accessToken: accessToken, refreshToken: refToken})
   } catch (error) 
   {
    next(error)    
   }
   
   
   
    // res.send(`refresh route`)
})



router.delete(`/logout`, async (req, res, next) => {
    res.send(`logout route`)
})

module.exports = router