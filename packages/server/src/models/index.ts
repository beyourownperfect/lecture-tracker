import { Schema, model } from "mongoose";

function toJSONTransform(_doc: unknown, ret: Record<string, unknown>) {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
}

const subjectSchema = new Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } },
);

const topicSchema = new Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    totalPyqs: { type: Number, default: 0 },
    solvedPyqs: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } },
);

const revisionSchema = new Schema(
  {
    type: { type: String, enum: ["NOTES", "FLASHCARDS"], required: true },
    scheduledDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    revisionNumber: { type: Number, default: null },
    lectureId: { type: Schema.Types.ObjectId, ref: "Lecture", required: true },
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } },
);

const lectureSchema = new Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } },
);

const topicTestSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    score: { type: Number, default: null },
    completed: { type: Boolean, default: false },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } },
);

const subjectTestSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    score: { type: Number, default: null },
    completed: { type: Boolean, default: false },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } },
);

const fullMockTestSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    score: { type: Number, default: null },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { transform: toJSONTransform } },
);

subjectSchema.index({ order: 1 });
topicSchema.index({ subjectId: 1, order: 1 });
lectureSchema.index({ topicId: 1, order: 1 });
lectureSchema.index({ completed: 1 });
revisionSchema.index({ lectureId: 1, scheduledDate: 1 });
revisionSchema.index({ completed: 1, scheduledDate: 1 });
subjectTestSchema.index({ subjectId: 1, date: -1 });
topicTestSchema.index({ topicId: 1, date: -1 });
fullMockTestSchema.index({ date: -1 });

export const Subject = model("Subject", subjectSchema);
export const Topic = model("Topic", topicSchema);
export const Lecture = model("Lecture", lectureSchema);
export const Revision = model("Revision", revisionSchema);
export const SubjectTest = model("SubjectTest", subjectTestSchema);
export const TopicTest = model("TopicTest", topicTestSchema);
export const FullMockTest = model("FullMockTest", fullMockTestSchema);
