import mongoose, { Document, Schema } from "mongoose";

interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "1h" },
    },
  },
  { timestamps: true }
);

export const SessionModel = mongoose.model<ISession>("Session", SessionSchema);
