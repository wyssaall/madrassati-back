import mongoose, { Document, Schema } from "mongoose";

export interface IParent extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  children: mongoose.Types.ObjectId[]; // Array of student IDs
  childrenClasses: string[]; // Array of children's class names
  messagesCount: number;
  meetingsCount: number;
  alertsCount: number;
  upcomingEvents: {
    title: string;
    date: Date;
    time: string;
  }[];
}

const ParentSchema = new Schema<IParent>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  children: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  childrenClasses: [{ type: String }], // Array of children's class names
  messagesCount: { type: Number, default: 0 },
  meetingsCount: { type: Number, default: 0 },
  alertsCount: { type: Number, default: 0 },
  upcomingEvents: [
    {
      title: String,
      date: Date,
      time: String,
    },
  ],
});

export const Parent = mongoose.model<IParent>("Parent", ParentSchema);
