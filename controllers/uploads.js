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
          userId: req.body.userId // Add userId parameter from client side
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
      res.status(200).json({ success: true });
    }
  });
};

const getPdfs = async (req, res) => {
  try {
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const files = await gfs.find({ 'metadata.userId': req.query.userId }).sort({ uploadDate: -1 }).toArray();

    if (files.length > 0) {
      const file = files[0];
      res.status(200).json({
        filename: file.filename,
        contentType: file.contentType,
        fileId: file._id.toString()
      });
    } else {
      res.status(206).json({ error: 'No PDFs found' });
    }
  } catch (error) {
    console.error(error);
    res.status(206).json({ error: 'Failed to get PDFs' });
  }
};



module.exports = { uploadFile, getPdfs };