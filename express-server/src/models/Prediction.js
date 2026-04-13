import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inputText: {
      type: String,
      required: true,
      trim: true,
    },
    prediction: {
      is_gap_direct: { type: String, required: true },
      energy_per_atom: { type: Number, required: true },
      formation_energy_per_atom: { type: Number, required: true },
      band_gap: { type: Number, required: true },
      e_above_hull: { type: Number, required: true },
      volume: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

const Prediction = mongoose.model("Prediction", predictionSchema);

export default Prediction;
