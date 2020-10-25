require('dotenv').config();
const express = require('express');
const router = express.Router();
const authHelper = require('../helpers/authHelper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require("../../DB/models");
const authMiddleware = require('../middleware/authMiddleware');
const User = db.users;
const Token = db.tokens;


router.post('/signup', async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password){
        res.status(400).json({message: 'You need to provide email and password!'});
            return;
    }
    try {
        const userExist = await User.findOne({where: {email: email.trim()}});
        if (userExist) {
            res.status(409).json({message: 'User with such email already exists!'});
            return;
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({email, passwordHash: hashedPassword});
        const token = authHelper.generateRefreshToken();
        await Token.create({tokenId: token.id, userId: user.id });
        res.status(201).json({
            accessToken: authHelper.generateAccessToken(user.id),
            refreshToken: token.token
        })
    } catch (err) {
        res.status(500).json({message: err.message});
    }
})

router.post('/signin', async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password){
        res.status(400).json({message: 'You need to provide email and password!'});
        return;
    }
    try {
    const user = await User.findOne({where: {email: email.trim()}});
    if (!user) {
        res.status(404).json({message: "User does not exists!"});
        return;
    }
    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (isValid) {
        await updateTokens(user.id).then(tokens => res.status(201).json(tokens));
    } else {
        throw new Error("Invalid credentials!", 401);
    }
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

router.post('/signin/new_token', async (req, res) => {
    const { refreshToken } =  req.body;
    if (!refreshToken){
        res.status(400).json({message: 'You need to provide refreshToken!'});
        return;
    }
    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (payload.type !== 'refresh'){
            res.status(401).json({message: "Invalid token!"});
            return;
        }
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({message: "Token inspired!"});
            return;
        } else if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({message: "Invalid token!"});
            return;
        } else {
            res.status(500).json({message: err.message});
            return;
        }
    }

    try {
        const token = await Token.findOne({where: {tokenId: payload.id}});
        if (token === null) {
            throw new Error("Invalid token!");
        }
        return await updateTokens(token.userId).then(tokens => res.status(201).json(tokens));
    } catch (err){
        res.status(500).json({message: err.message});
    }
})

router.get('/info', authMiddleware, async (req, res) => {
    try {
        const userId = await authHelper.verifyToken(req);
        console.log(userId);
        const user = await User.findOne({where:{id: userId}});
        if (!user) {
            res.status(404).json({message: "No such user!"});
            return;
        }
        res.status(200).json({email: user.email})
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

router.get('/logout', authMiddleware, async (req, res) => {
    try {
        const userId = await authHelper.verifyToken(req);
        const newRefreshToken = authHelper.generateRefreshToken();
        await Token.destroy({where: {userId}})
        .then(() => Token.create({tokenId: newRefreshToken.token, userId}));
        res.status(200).json({refreshToken: newRefreshToken.token});
    } catch (err){
        res.status(500).json({message: err.message});
    }
})

const updateTokens = async (userId) => {
   const accessToken = authHelper.generateAccessToken(userId);
   const refreshToken = authHelper.generateRefreshToken();

   return await authHelper.replaceDbRefreshToken(refreshToken.id, userId)
   .then(() => ({
       accessToken,
       refreshToken: refreshToken.token
   }));
}

module.exports = router;

