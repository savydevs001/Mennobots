import { Schema, model, models } from "mongoose";

const administratorSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

// Use the existing model if it has already been compiled, otherwise create a new one
const Administrator =
  models.Administrator || model("Administrator", administratorSchema);

export default Administrator;
