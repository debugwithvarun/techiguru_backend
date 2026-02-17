const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getMyCertificates,
  uploadCertificateImage
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ----MULTER CONFIGURATION (For Image Upload)----
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    cb(null, `cert-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});


router.post('/upload', protect, upload.single('image'), uploadCertificateImage);

router
  .route('/')
  .get(getCertificates)
  .post(protect, authorize('instructor', 'admin'), createCertificate);

router
  .route('/mycertificates')
  .get(protect, authorize('instructor', 'admin'), getMyCertificates);

router
  .route('/:id')
  .get(getCertificateById)
  .put(protect, authorize('instructor', 'admin'), updateCertificate)
  .delete(protect, authorize('instructor', 'admin'), deleteCertificate);

module.exports = router;