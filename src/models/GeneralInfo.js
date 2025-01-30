import { Schema, model, models } from 'mongoose';

const generalInfoSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nameOrBusinessName: { type: String, required: true },
  ruc: { type: String, required: true },
  dateOfIncorporation: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  officeAddress: { type: String, required: true },
});

const GeneralInfo = models.GeneralInfo || model('GeneralInfo', generalInfoSchema);

export default GeneralInfo;
