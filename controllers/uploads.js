const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
require('dotenv').config();
const { Types: { ObjectId } } = require('mongoose');

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
          userId: req.body, // Add userId parameter from client side
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
      const tipo = req.file.metadata.tipo;
      res.status(200).json({ success: true, fileId, userId, tipo });
    }
  });
};

const getPdfsEspecifico = async (req, res) => {
  try {
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const fileId = new ObjectId(req.params.fileId);
    const files = await gfs.find({ '_id': fileId }).sort({ uploadDate: -1 }).toArray();

    if (files.length > 0) {
      const file = files[0];
      const stream = gfs.openDownloadStream(file._id);
      res.set('Content-Type', file.contentType);
      stream.pipe(res);
    } else {
      res.status(206).json({ message: 'No hay ningún comprobante cargado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(206).json({ error: 'Failed to get PDFs' });
  }
};

const getPdf = async (req, res) => {
  try {
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const files = await gfs.find({ 'metadata.userId.userId': req.params.userId, 'metadata.userId.tipo': 'recibo'}).sort({ uploadDate: -1 }).toArray();

    if (files.length > 0) {
      const file = files[0];
      const stream = gfs.openDownloadStream(file._id);
      res.set('Content-Type', file.contentType);
      stream.pipe(res);
    } else {
      res.status(206).json({ message: 'No hay ningún recibo cargado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(206).json({ error: 'Failed to get PDFs' });
  }
};

const getPdfComprobante = async (req, res) => {
  try {
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const files = await gfs.find({ 'metadata.userId.userId': req.params.userId, 'metadata.userId.tipo': 'comprobante'}).sort({ uploadDate: -1 }).toArray();

    if (files.length > 0) {
      const file = files[0];
      const stream = gfs.openDownloadStream(file._id);
      res.set('Content-Type', file.contentType);
      stream.pipe(res);
    } else {
      res.status(206).json({ message: 'No hay ningún comprobante cargado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(206).json({ error: 'Failed to get PDFs' });
  }
};

const getPdfs = async (req, res) => {
  try {
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const comprobantesFiles = await gfs.find({ 'metadata.userId.userId': req.params.userId, 'metadata.userId.tipo': 'comprobante' }).sort({ uploadDate: -1 }).toArray();
    const recibosFiles = await gfs.find({ 'metadata.userId.userId': req.params.userId, 'metadata.userId.tipo': 'recibo' }).sort({ uploadDate: -1 }).toArray();

    const comprobantesUrls = comprobantesFiles.map(file => {
      const stream = gfs.openDownloadStream(file._id);
      const uploadDate = new Date(file.uploadDate);
      const formattedDate = uploadDate.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).split('/').join('/');
      return {
        id: file._id,
        url: stream.url, // Replace with the appropriate method to generate a URL for the stream
        name: file.filename,
        date: formattedDate,
        type: 'comprobante'
      };
    });

    const recibosUrls = recibosFiles.map(file => {
      const stream = gfs.openDownloadStream(file._id);
      const uploadDate = new Date(file.uploadDate);
      const formattedDate = uploadDate.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).split('/').join('/');
      return {
        id: file._id,
        url: stream.url, // Replace with the appropriate method to generate a URL for the stream
        name: file.filename,
        date: formattedDate,
        type: 'recibo'
      };
    });

    const allUrls = [...comprobantesUrls, ...recibosUrls];

    if (allUrls.length > 0) {
      res.status(200).json({ comprobantes: comprobantesUrls, recibos: recibosUrls });
    } else {
      res.status(206).json({ message: 'No hay ningún comprobante o recibo cargado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(206).json({ error: 'Failed to get PDFs' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.fileId);

    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    await gfs.delete(fileId);
    res.status(200).json('Archivo eliminado con éxito.')
  } catch (error) {
    res.status(206).json(error.message)
  }
};

module.exports = { uploadFile, getPdf, getPdfs, getPdfsEspecifico, deleteFile, getPdfComprobante };