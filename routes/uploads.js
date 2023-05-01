const express = require('express');
const router = express.Router();
const { uploadFile, getPdfs, downloadFile } = require('../controllers/uploads');

router.post('/upload-file', uploadFile);
router.get('/getpdf/:userId', getPdfs);

module.exports = router;