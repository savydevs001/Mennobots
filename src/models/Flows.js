import { Schema, models, model } from "mongoose";

const FlowsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  apiType: {
    type: Number,
    enum: [0, 1], // Numeric representation
    required: true,
  },
  rucId: {
    type: Schema.Types.ObjectId,
    ref: "CompanyPassword",  
    required: true,
  },
  downloadedFiles: {
    type: Number,
    default: 0,
  },
  executionCount: {
    type: Number,
    default: 0,
  },
  year: {
    type: String, // e.g., "2024"
    required: true,
  },
  month: {
    type: Number, //1-12
    min: 1,
    max: 12,
    required: true,
  },
  date: {
    type: Number, // 0-31
    min: 0,
    max: 31,
    required: true,
  },
  voucherType: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6],
    required: true,
  },
  schedule: {
    type: {
      days: {
        type: [Number], // Array of days (0-6)
        required: true,
      },
      times: {
        type: [String], // Array of times (e.g., ["08:00", "14:30"])
        required: true,
      },
    },
    default: {},
    _id: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Define a virtual that automatically populates `rucId`
FlowsSchema.virtual('rucDetails', {
  ref: 'Ruc', // the model to populate
  localField: 'rucId', // field in the current document
  foreignField: '_id', // field in the referenced model
  justOne: true,
});

// Apply the virtual population to all queries (this is crucial)
FlowsSchema.set('toObject', { virtuals: true });
FlowsSchema.set('toJSON', { virtuals: true });

const Flows = models?.Flows || model("Flows", FlowsSchema);

export default Flows;
