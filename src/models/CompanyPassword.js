import { Schema, model, models } from "mongoose";

const companyPasswordSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  site: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
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

companyPasswordSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Use the existing model if it has already been compiled, otherwise create a new one
const CompanyPassword = models.CompanyPassword || model("CompanyPassword", companyPasswordSchema);

export default CompanyPassword;
