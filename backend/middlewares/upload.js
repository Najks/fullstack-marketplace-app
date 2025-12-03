const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const allowedMime = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = allowedExt.has(ext) ? ext : '';
        const id =
            (crypto.randomUUID && crypto.randomUUID()) ||
            crypto.randomBytes(16).toString('hex');
        cb(null, `${id}${safeExt}`);
    },
});

const fileFilter = (_req, file, cb) => {
    if (allowedMime.has(file.mimetype)) return cb(null, true);
    return cb(new Error('Invalid file type. Only images are allowed.'), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

function publicPathFor(storedName) {
    const safeName = path.basename(storedName || '');
    return `/uploads/${encodeURIComponent(safeName)}`;
}
function getPublicUploadUrl(req, storedName) {
    const base = `${req.protocol}://${req.get('host')}`;
    return base + publicPathFor(storedName);
}
function serveUploads(app) {
    const express = require('express');
    app.use(
        '/uploads',
        express.static(uploadDir, {
            dotfiles: 'ignore',
            index: false,
            fallthrough: true,
            etag: true,
            maxAge: '365d',
            immutable: true,
            setHeaders: (res) => {
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('Content-Disposition', 'inline');
            },
        }),
    );
}

module.exports = upload;
module.exports.serveUploads = serveUploads;
module.exports.publicPathFor = publicPathFor;
module.exports.getPublicUploadUrl = getPublicUploadUrl;
