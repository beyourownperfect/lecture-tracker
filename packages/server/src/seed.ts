import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import { Subject } from "./models/index.js";

export const PRESET_SUBJECTS = [
  "C Programming",
  "Data Structures",
  "Algorithms",
  "Operating Systems",
  "Computer Networks",
  "DBMS",
  "Computer Organization & Architecture",
  "Theory of Computation",
  "Compiler Design",
  "Digital Logic",
  "Engineering Mathematics",
  "Discrete Mathematics",
];

export async function seedSubjects() {
  for (let i = 0; i < PRESET_SUBJECTS.length; i++) {
    await Subject.findOneAndUpdate(
      { name: PRESET_SUBJECTS[i] },
      { name: PRESET_SUBJECTS[i], order: i },
      { upsert: true, new: true },
    );
    console.log(`Seeded: ${PRESET_SUBJECTS[i]}`);
  }
  console.log("Seed complete");
}

// Run directly with `npm run db:seed`
const isMain = process.argv[1]?.includes("seed");
if (isMain) {
  (async () => {
    await connectDB();
    await seedSubjects();
    await mongoose.disconnect();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
