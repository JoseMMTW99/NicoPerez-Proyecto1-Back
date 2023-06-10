const express = require('express');
const router = express.Router();
const { uploadFile, getPdf, getPdfs, getPdfsEspecifico, deleteFile, getPdfComprobante } = require('../controllers/uploads');

router.post('/upload-file', uploadFile);
router.get('/getpdf-ultimo/:userId', getPdf);
router.get('/getpdf-ultimo-comprobante/:userId', getPdfComprobante);
router.get('/getpdf/:userId', getPdfs);
router.get('/getpdf-especifico/:fileId', getPdfsEspecifico);
router.delete('/delete-pdf/:fileId', deleteFile);

module.exports = router;