import { Router } from "express";
import Entry from "../models/Entry.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res) => {
  const entries = await Entry.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
  res.json(entries);
});

router.post("/", async (req, res) => {
  try {
    const { type, title, detail = "", value = 0 } = req.body;
    if (!["Workout", "Meal", "Steps"].includes(type) || !title?.trim()) {
      return res.status(400).json({ message: "Choose a valid type and enter a title." });
    }
    const entry = await Entry.create({
      user: req.userId, type, title: title.trim(), detail: String(detail).slice(0, 300),
      value: Math.max(0, Number(value) || 0)
    });
    res.status(201).json(entry);
  } catch {
    res.status(500).json({ message: "Could not save entry." });
  }
});

router.delete("/:id", async (req, res) => {
  const deleted = await Entry.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!deleted) return res.status(404).json({ message: "Entry not found." });
  res.json({ message: "Entry deleted." });
});

export default router;
