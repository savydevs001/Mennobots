import mongoose, { model, models } from "mongoose";

const { Schema } = mongoose;

const licenseSchema = new Schema(
  
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expirationDate: {
      type: Date,
      required: true,
    },

    readyForProduction: {
      type: Boolean,
      default: false,
    },

    isOnlineLicense: {
      type: Boolean,
      default: false,
    },
    
    tokenValue: {
      type: String,
      required: true,
      unique: true,
    }
  },
  { timestamps: true }
);

const Licenses = models?.Licenses || model("Licenses", licenseSchema);

export default Licenses;
