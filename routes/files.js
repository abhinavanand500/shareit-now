const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");

let storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, "uploads/"),
    filename: (req, file, callback) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
        )}${path.extname(file.originalname)}`;
        callback(null, uniqueName);
    },
});

let upload = multer({ storage, limits: { fileSize: 1000000 * 100 } }).single(
    "myfile",
); //100mb

router.post("/", (req, res) => {
    // Store Files
    console.log("req");
    upload(req, res, async (err) => {
        // Validate Request
        if (!req.file) {
            return res.json({ error: "All Fields are Required" });
        }

        if (err) {
            return res.status(500).send({ error: err.message });
        }

        // Store Information in Database
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size,
        });
        const response = await file.save();
        return res.json({
            file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
        });

        //Response of Link
    });
});

router.post("/send", async (req, res) => {
    const { uuid, emailTo, emailFrom } = req.body;
    if (!uuid || !emailTo || !emailFrom) {
        return res.status(404).send({ error: "All Fields are required" });
    }
    // GET DATA FROM DATABASE
    const file = await File.findOne({ uuid: uuid });
    // if (file.sender) {
    //     return res.status(422).send({ error: "Email Already Sent" });
    // }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    // SEND EMAIL
    const sendMail = require("../services/emailServices");
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: "File Sharing",
        text: `${emailFrom} shared a file with you`,
        html: require("../services/emailTemplate")({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size / 1000) + " KB",
            expires: "24 hours",
        }),
    });
    return res.send({ success: "Succesfully Sent" });
});

module.exports = router;
