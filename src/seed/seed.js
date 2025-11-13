import "dotenv/config";
import { connectDB, habitsCol } from "../db.js";

const seedUser = {
  userEmail: "demo@habit.app",
  userName: "Demo User",
  creatorPhotoURL: "https://i.pravatar.cc/100?img=12"
};

const base = [
  { title: "Sunrise Water & Stretch", desc: "Drink 300ml water and a 5-minute stretch to wake up gently.", cat: "Morning", time: "06:30", img: "https://images.unsplash.com/photo-1517341720776-463fe925c19d" },
  { title: "Deep Work Sprint", desc: "One 50-minute focused session. Phone on DND.", cat: "Work", time: "09:00", img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4" },
  { title: "10k Steps Walk", desc: "Evening walk aiming for 10,000 steps.", cat: "Fitness", time: "18:30", img: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6" },
  { title: "Evening Reflection", desc: "Write 3 wins and 1 lesson.", cat: "Evening", time: "21:15", img: "https://images.unsplash.com/photo-1515876301921-40e5c5fb0b8f" },
  { title: "Focused Reading", desc: "Read 10 pages of non-fiction.", cat: "Study", time: "20:00", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba" },
  { title: "Protein Breakfast", desc: "Include 20g protein in breakfast.", cat: "Morning", time: "07:30", img: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea" },
  { title: "Inbox Zero Block", desc: "Clear important emails in 25 minutes.", cat: "Work", time: "10:30", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c" },
  { title: "Mobility Mini", desc: "7-minute mobility for hips & shoulders.", cat: "Fitness", time: "17:45", img: "https://images.unsplash.com/photo-1546484959-f9a53db89a4d" },
  { title: "Family Check-in", desc: "Call or text one family member.", cat: "Evening", time: "20:30", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4" },
  { title: "Vocabulary Builder", desc: "Learn 5 new words.", cat: "Study", time: "19:30", img: "https://images.unsplash.com/photo-1498079022511-d15614cb1c02" },
  { title: "Morning Mindfulness", desc: "3-minute breathing practice.", cat: "Morning", time: "06:45", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
  { title: "Stand-Up Notes", desc: "Prepare 3 bullets for stand-up.", cat: "Work", time: "09:45", img: "https://images.unsplash.com/photo-1494173853739-c21f58b16055" },
  { title: "Core Quickie", desc: "Plank + hollow hold total 5 min.", cat: "Fitness", time: "18:00", img: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1" },
  { title: "Digital Sunset", desc: "Screens off 30 minutes before sleep.", cat: "Evening", time: "22:00", img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305" },
  { title: "Spaced Repetition", desc: "Review flashcards for 15 minutes.", cat: "Study", time: "07:00", img: "https://images.unsplash.com/photo-1455390582262-044cdead277a" }
];

async function run() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "habitdb";
  await connectDB(uri, dbName);

  const col = habitsCol();
  await col.deleteMany({}); 

  const now = new Date();
  const docs = base.map(x => ({
    title: x.title,
    description: x.desc,
    category: x.cat,
    reminderTime: x.time,
    imageUrl: x.img,
    isPublic: true,
    ...seedUser,
    completionHistory: [],
    createdAt: now,
    updatedAt: now
  }));

  const result = await col.insertMany(docs);
  console.log(`✅ Seeded ${result.insertedCount} habits`);
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
