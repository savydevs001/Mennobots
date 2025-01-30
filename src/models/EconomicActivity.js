import { Schema, model, models } from 'mongoose';

const economicActivitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    corporatePurpose: {
      type: String,
      required: true,
    },
    mainActivity: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const EconomicActivity = models.EconomicActivity || model('EconomicActivity', economicActivitySchema);

export default EconomicActivity;
