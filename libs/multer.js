const multer = require("multer");

const upload = multer({
    limits: { fileSize: 1024 * 1024 * 10 },
    fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "video/mp4"];

        if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            const err = new Error(
                `Only ${allowedMimeTypes.join(", ")} allowed to upload.`
            );
            callback(err, false);
        }
    },
    onError: (err, next) => {
        next(err);
    },
})

module.exports = upload;