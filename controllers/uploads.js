const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
require('dotenv').config();

const conn = mongoose.createConnection(process.env.URL);

let gfs;

conn.once('open', () => {
  // initialize stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
});

// Set up storage engine
const storage = new GridFsStorage({
  url: process.env.URL,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: file.originalname,
        bucketName: 'uploads',
        metadata: {
          userId: req.body // Add userId parameter from client side
        }
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({
  storage
}).single('file');

const uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(206).json({ error: err });
    } else {
      const fileId = req.file.id;
      const userId = req.file.metadata.userId;
      res.status(200).json({ success: true, fileId, userId });
    }
  });
};

const getPdfs = async (req, res) => {
  console.log(req.params.userId);
  try {
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const files = await gfs.find({ 'metadata.userId.userId': req.params.userId }).sort({ uploadDate: -1 }).toArray();

    if (files.length > 0) {
      const file = files[0];
      const stream = gfs.openDownloadStream(file._id);
      res.set('Content-Type', file.contentType);
      res.set('Content-Disposition', `attachment; filename=${file.filename}`);
      stream.pipe(res);
    } else {
      res.status(206).json({ message: 'No hay ningún comprobante cargado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(206).json({ error: 'Failed to get PDFs' });
  }
};


module.exports = { uploadFile, getPdfs };