const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  uploadCourseImage
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- MULTER CONFIGURATION (For Image Upload) ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Make sure to create this 'uploads' folder in your server root or it will throw an error
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
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

// --- ROUTES ---

// Upload Route (Placed before /:id to avoid ID conflicts)
router.post('/upload', protect, upload.single('image'), uploadCourseImage);

router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router
  .route('/mycourses')
  .get(protect, authorize('instructor', 'admin'), getMyCourses);

router
  .route('/:id')
  .get(getCourseById)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;