require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const db = require("../../DB/models");
const Token = db.tokens;

const generateAccessToken = (userId) => {
	const payload = {
		userId,
		type: "access",
	};
	const options = {
		expiresIn: "10m",
	};

	return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const generateRefreshToken = () => {
	const payload = {
		id: uuidv4(),
		type: "refresh",
	};
	const options = {
		expiresIn: "30m",
	};

	return {
		id: payload.id,
		token: jwt.sign(payload, process.env.JWT_SECRET, options),
	};
};

const replaceDbRefreshToken = async (tokenId, userId) => {
	console.log(tokenId);
	try {
		await Token.destroy({ where: { userId } }).then(() =>
			Token.create({ id: uuidv4(), tokenId, userId })
		);
	} catch (err) {
		throw new Error(err.message);
	}
};

const verifyToken = async (req) => {
	const authHeader = req.get("Authorization");
	const token = authHeader.replace("Bearer ", "");
	const payload = jwt.verify(token, process.env.JWT_SECRET);
	return payload.userId;
};

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	replaceDbRefreshToken,
	verifyToken,
};
