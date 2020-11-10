require("dotenv").config();
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const getPagination = require("../../utils/getPagination.util");
const db = require("../../DB/models");
const mime = require("mime");
const File = db.fileInfo;
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

router.post("/upload", authMiddleware, async (req, res) => {
	let file;
	let uploadPath;

	if (!req.files || Object.keys(req.files).length === 0) {
		res.status(400).send("No files were uploaded.");
		return;
	}

	file = req.files.file;
	const fileName = uuidv4();
	uploadPath = "./uploads/" + fileName + "." + mime.getExtension(file.mimetype);
	file.mv(uploadPath, (err) => {
		if (err) {
			return res.status(500).send(err);
		}
	});

	try {
		const newFile = await File.create({
			id: uuidv4(),
			title: fileName,
			extension: mime.getExtension(file.mimetype),
			mimeType: file.mimetype,
			size: file.size,
		});
		res.status(201).json(newFile);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/download/:id", authMiddleware, async (req, res) => {
	try {
		const fileInfo = await File.findOne({ where: { id: req.params.id } });
		if (!fileInfo) {
			res.status(404).json({ message: "No file with such id!" });
		}
		const filePath = `./uploads/${fileInfo.title}.${fileInfo.extension}`;
		res.download(filePath);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
	try {
		const fileInfo = await File.findOne({ where: { id: req.params.id } });
		if (!fileInfo) {
			res.status(404).json({ message: "No file with such id!" });
		}
		await File.destroy({ where: { id: fileInfo.id } });
		const filePath = `./uploads/${fileInfo.title}.${fileInfo.extension}`;
		fs.unlink(filePath, () => {
			res.status(200).send();
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.put("/update/:id", authMiddleware, async (req, res) => {
	try {
		const fileInfo = await File.findOne({ where: { id: req.params.id } });

		if (!fileInfo) {
			res.status(404).json({ message: "No file with such id!" });
		}

		if (!req.files || Object.keys(req.files).length === 0) {
			res.status(400).send("No files were uploaded.");
			return;
		}

		const filePathRemove = `./uploads/${fileInfo.title}.${fileInfo.extension}`;
		fs.unlink(filePathRemove, () => {});

		let file = req.files.file;
		const fileName = uuidv4();
		let uploadPath =
			"./uploads/" + fileName + "." + mime.getExtension(file.mimetype);
		file.mv(uploadPath, (err) => {
			if (err) {
				return res.status(500).send(err);
			}
		});

		const updatedRecord = await fileInfo.update({
			title: fileName,
			extension: mime.getExtension(file.mimetype),
			size: file.size,
			mimeType: file.mimetype,
		});
		res.status(200).json(updatedRecord);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/list", authMiddleware, async (req, res) => {
	const { page, list_size } = req.query;
	const { limit, offset } = getPagination.getPagination(page, list_size);

	try {
		const { count, rows } = await File.findAndCountAll({ limit, offset });
		res.status(201).json({ total: count, data: rows });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get("/:id", authMiddleware, async (req, res) => {
	try {
		const fileInfo = await File.findOne({ where: { id: req.params.id } });
		if (!fileInfo) {
			res.status(404).json({ message: "No file with such id!" });
		}
		res.status(201).json(fileInfo);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
