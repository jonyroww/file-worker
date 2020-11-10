require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization");
	if (!authHeader) {
		res.status(401).json({ message: "Token not provided!" });
		return;
	}

	const token = authHeader.replace("Bearer ", "");
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		if (payload.type !== "access") {
			res.status(401).json({ message: "Invalid token!" });
			return;
		}
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			res.status(401).json({ message: "Token inspired!" });
			return;
		}
		if (err instanceof jwt.JsonWebTokenError) {
			res.status(401).json({ message: "Invalid token!" });
			return;
		}
	}

	next();
};
