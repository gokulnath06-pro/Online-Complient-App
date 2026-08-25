import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide an overall rating (1-5)'],
      min: 1,
      max: 5,
    },
    speedRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    serviceRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
