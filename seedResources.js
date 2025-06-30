const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

const resourceSchema = new mongoose.Schema({
  title: String,
  contentUrl: String,
  type: { type: String, enum: ["Video", "Article", "Quiz"] },
  subjectTags: [String],
  difficultyLevel: String,
  description: String,
  ratings: [
    {
      user: mongoose.Schema.Types.ObjectId,
      rating: Number,
      ratedAt: Date,
    },
  ],
  averageRating: Number,
});

const Resource = mongoose.model("Resource", resourceSchema);

const resources = [
  {
    title: "Intro to Calculus",
    contentUrl: "https://www.khanacademy.org/math/calculus-1",
    type: "Video",
    subjectTags: ["Math", "Calculus"],
    difficultyLevel: "Beginner",
    description: "A beginner-friendly video series introducing the basics of calculus.",
    averageRating: 4.5,
  },
  {
    title: "Basics of Python Programming",
    contentUrl: "https://realpython.com/python-beginners-guide/",
    type: "Article",
    subjectTags: ["Programming", "Python"],
    difficultyLevel: "Beginner",
    description: "Comprehensive article on getting started with Python programming.",
    averageRating: 4.7,
  },
  {
    title: "Physics Mechanics Quiz",
    contentUrl: "https://quizizz.com/admin/quiz/5ebcf9a2f5cc75001e122ee0",
    type: "Quiz",
    subjectTags: ["Physics", "Mechanics"],
    difficultyLevel: "Intermediate",
    description: "Quiz to test your understanding of Newtonian Mechanics.",
    averageRating: 4.2,
  },
  {
    title: "JavaScript Promises Explained",
    contentUrl: "https://www.youtube.com/watch?v=DHvZLI7Db8E",
    type: "Video",
    subjectTags: ["Programming", "JavaScript"],
    difficultyLevel: "Intermediate",
    description: "Video tutorial explaining how promises work in JavaScript.",
    averageRating: 4.6,
  },
  {
    title: "Organic Chemistry Overview",
    contentUrl: "https://www.chemguide.co.uk/organicprops/menu.html",
    type: "Article",
    subjectTags: ["Chemistry", "Organic"],
    difficultyLevel: "Advanced",
    description: "In-depth article covering properties of organic compounds.",
    averageRating: 4.4,
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await Resource.deleteMany({});
  await Resource.insertMany(resources);
  console.log("✅ Resources seeded.");
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seeding error:", err);
  mongoose.disconnect();
});
