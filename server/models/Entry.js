import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Workout", "Meal", "Steps"], required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  detail: { type: String, default: "", maxlength: 300 },
  value: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

export default mongoose.model("Entry", entrySchema);
