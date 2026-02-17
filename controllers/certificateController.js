const Certificate = require('../models/Certificate');

// @desc    Get all active certificates (Public)
// @route   GET /api/certificates
// @access  Public
const getCertificates = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    // For public view, usually we only want Active certificates
    const certificates = await Certificate.find({ ...keyword, status: 'Active' })
      .populate('instructor', 'name avatar title')
      .sort({ createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id).populate('instructor', 'name avatar title');

    if (certificate) {
      res.json(certificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a certificate
// @route   POST /api/certificates
// @access  Private (Instructor/Admin)
const createCertificate = async (req, res) => {
  try {
    const newCertificate = new Certificate({
      ...req.body,
      instructor: req.user._id,
    });

    const createdCertificate = await newCertificate.save();
    res.status(201).json(createdCertificate);
  } catch (error) {
    res.status(400).json({ message: 'Invalid certificate data', error: error.message });
  }
};

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Private (Instructor only)
const updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (certificate) {
      // Check ownership
      if (certificate.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this certificate' });
      }

      // Update fields
      certificate.title = req.body.title || certificate.title;
      certificate.description = req.body.description || certificate.description;
      certificate.genre = req.body.genre || certificate.genre;
      certificate.link = req.body.link || certificate.link;
      certificate.status = req.body.status || certificate.status;
      certificate.thumbnail = req.body.thumbnail || certificate.thumbnail;

      const updatedCertificate = await certificate.save();
      res.json(updatedCertificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private (Instructor/Admin)
const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (certificate) {
      // Check ownership
      if (certificate.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this certificate' });
      }

      await certificate.deleteOne();
      res.json({ message: 'Certificate removed' });
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get certificates created by current instructor
// @route   GET /api/certificates/mycertificates
// @access  Private (Instructor)
const getMyCertificates = async (req, res) => {
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    
    const certificates = await Certificate.find({ 
        instructor: req.user._id,
        ...statusFilter 
    }).sort({ updatedAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload Certificate Thumbnail
// @route   POST /api/certificates/upload
// @access  Private
const uploadCertificateImage = async (req, res) => {
  try {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
    
    res.status(200).json({ 
        url: imagePath,
        message: 'Image uploaded successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
};

module.exports = {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getMyCertificates,
  uploadCertificateImage,
};