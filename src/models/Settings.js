import mongoose, { model, models } from "mongoose";

const { Schema } = mongoose;

const settingsSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },

    port: {
      type: String,
      required: true,
      default: "50000", // Default port value
    },

    language: {
      type: String,
      required: true,
      default: "EN", // Default language value
    },
  },
  { timestamps: true }
);

const Settings = models?.Settings || model("Settings", settingsSchema);

export default Settings;
