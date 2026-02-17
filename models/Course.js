  const mongoose = require('mongoose');
  const slugify = require('slugify'); 

  // --- 1. LESSON SCHEMA (Embedded) ---
  const lessonSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['video', 'text', 'quiz'],
      default: 'video'
    },
    videoKey: {
      type: String, // YouTube ID or S3 Key
      required: function() { return this.type === 'video'; }
    },
    videoDuration: {
      type: Number, // Stored in seconds
      default: 0
    },
    // --- NEW FIELD ADDED HERE ---
    description: {
      type: String, 
      trim: true,
      default: '' 
    },
    content: {
      type: String, // Markdown content for text lessons
    },
    isFree: {
      type: Boolean,
      default: false // Defines if this is a "Preview" lesson
    }
  });

  // --- 2. SECTION SCHEMA (Embedded) ---
  const sectionSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true
    },
    lessons: [lessonSchema] // Array of lessons
  });

  // --- 3. MAIN COURSE SCHEMA ---
  const courseSchema = new mongoose.Schema({
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: {
      type: String,
      unique: true
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Subtitle cannot be more than 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Development', 'Business', 'Design', 'Marketing', 'Lifestyle', 'IT & Software']
    },
    level: {
      type: String,
      enum: ['All Levels', 'Beginner', 'Intermediate', 'Expert'],
      default: 'All Levels'
    },
    language: {
      type: String,
      default: 'English'
    },
    // Pricing
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      default: 0
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function(val) {
          return !val || val <= this.price; 
        },
        message: 'Discount price ({VALUE}) should be less than regular price'
      }
    },
    // Media
    thumbnail: {
      public_id: {
        type: String,
        required: false
      },
      url: {
        type: String,
        default: 'https://via.placeholder.com/640x360.png?text=Course+Thumbnail'
      }
    },
    demoVideo: {
      url: String,
      public_id: String
    },
    // Learning Data
    learningPoints: {
      type: [String],
      validate: [arrayLimit, '{PATH} exceeds the limit of 15 points']
    },
    requirements: {
      type: [String]
    },
    tags: {
      type: [String],
      index: true 
    },
    // Curriculum (Sections -> Lessons)
    sections: [sectionSchema],
    
    // Analytics & Status
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    studentsEnrolled: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Inactive'],
      default: 'Draft'
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  // --- INDEXES ---
  courseSchema.index({ title: 'text', description: 'text', category: 'text' });

  // --- MIDDLEWARE ---
  courseSchema.pre('save', async function() {
    if (this.isModified('title')) {
      this.slug = slugify(this.title, { lower: true, strict: true });
    }
  });

  function arrayLimit(val) {
    return val.length <= 15;
  }

  // Virtual Field: Total Course Duration
  courseSchema.virtual('totalDuration').get(function() {
    let totalSeconds = 0;
    if (this.sections && this.sections.length > 0) {
      this.sections.forEach(section => {
        if (section.lessons) {
          section.lessons.forEach(lesson => {
            if (lesson.type === 'video' && lesson.videoDuration) {
              totalSeconds += lesson.videoDuration;
            }
          });
        }
      });
    }
    return totalSeconds; 
  });

  module.exports = mongoose.model('Course', courseSchema);