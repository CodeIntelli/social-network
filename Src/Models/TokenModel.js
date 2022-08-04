import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types

const TokenSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
    ref: "user",
  },
  token: { type: String },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // 20 minutes
  expiresAt: { type: Date, expires: 1200 },
});

let TokenModel = mongoose.model("TokenVerification", TokenSchema);

export default TokenModel;
