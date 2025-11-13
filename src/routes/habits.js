import { Router } from "express";
import { habitsCol } from "../db.js";
import { ObjectId } from "mongodb";
import { calculateStreak, percentLast30 } from "../utils/streak.js";

const r = Router();
const col = () => habitsCol();


function isOwner(req, habit) {
  if (!req.user?.email) return true;     
  return habit.userEmail === req.user.email;
}


r.post("/", async (req, res) => {
  const { title, description, category, reminderTime, imageUrl, isPublic, userEmail, userName, creatorPhotoURL } = req.body;
  if (!title || !description || !category || !reminderTime || !userEmail || !userName)
    return res.status(400).json({ message: "Missing required fields" });

  const now = new Date();
  const doc = {
    title, description, category, reminderTime,
    imageUrl: imageUrl || "",
    isPublic: isPublic ?? true,
    userEmail, userName, creatorPhotoURL: creatorPhotoURL || "",
    completionHistory: [],
    createdAt: now, updatedAt: now
  };

  const result = await col().insertOne(doc);
  const saved = await col().findOne({ _id: result.insertedId });
  res.status(201).json({ message: "Habit created", habit: saved });
});


r.get("/mine", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: "email query required" });
  const list = await col().find({ userEmail: email }).sort({ createdAt: -1 }).toArray();
  res.json(list.map(h => ({ ...h, currentStreak: calculateStreak(h.completionHistory || []) })));
});


r.get("/public", async (req, res) => {
  const { search = "", category } = req.query;
  const filter = { isPublic: true };
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: "i" };
  const list = await col().find(filter).sort({ createdAt: -1 }).toArray();
  res.json(list);
});


r.get("/featured", async (_req, res) => {
  const list = await col().find({ isPublic: true }).sort({ createdAt: -1 }).limit(6).toArray();
  res.json(list);
});


r.get("/:id", async (req, res) => {
  const h = await col().findOne({ _id: new ObjectId(req.params.id) });
  if (!h) return res.status(404).json({ message: "Not found" });
  res.json({ ...h, currentStreak: calculateStreak(h.completionHistory || []), percent30: percentLast30(h.completionHistory || []) });
});


r.patch("/:id", async (req, res) => {
  const h = await col().findOne({ _id: new ObjectId(req.params.id) });
  if (!h) return res.status(404).json({ message: "Not found" });
  if (!isOwner(req, h)) return res.status(403).json({ message: "Not owner" });

  const { title, description, category, reminderTime, imageUrl, isPublic } = req.body;
  const { value } = await col().findOneAndUpdate(
    { _id: h._id },
    { $set: { title, description, category, reminderTime, imageUrl, isPublic, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
  res.json({ message: "Updated", habit: value });
});


r.delete("/:id", async (req, res) => {
  const h = await col().findOne({ _id: new ObjectId(req.params.id) });
  if (!h) return res.status(404).json({ message: "Not found" });
  if (!isOwner(req, h)) return res.status(403).json({ message: "Not owner" });

  const result = await col().deleteOne({ _id: h._id });
  if (!result.deletedCount) return res.status(500).json({ message: "Delete failed" });
  res.json({ message: "Deleted" });
});


r.post("/:id/complete", async (req, res) => {
  const h = await col().findOne({ _id: new ObjectId(req.params.id) });
  if (!h) return res.status(404).json({ message: "Not found" });
  if (!isOwner(req, h)) return res.status(403).json({ message: "Not owner" });

  const history = h.completionHistory || [];
  const dayKey = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const todayKey = dayKey(new Date());
  const done = new Set(history.map(c => dayKey(new Date(c.date))));

  if (!done.has(todayKey)) {
    await col().updateOne(
      { _id: h._id },
      { $push: { completionHistory: { date: new Date() } }, $set: { updatedAt: new Date() } }
    );
  }
  const updated = await col().findOne({ _id: h._id });
  res.json({
    message: done.has(todayKey) ? "Already done today" : "Marked complete",
    currentStreak: calculateStreak(updated.completionHistory || []),
    habit: updated
  });
});

export default r;
