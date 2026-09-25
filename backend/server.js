const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function connectToDatabase() {
  try {
    await client.connect();

    db = client.db("mern-task-db");

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "MERN Task API is running!"
  });
});

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await db
      .collection("tasks")
      .find()
      .toArray();

    res.json(tasks);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tasks"
    });
  }
});


app.post("/api/tasks", async (req, res) => {
  try {
    const newTask = {
      title: req.body.title,
      completed: false,
      createdAt: new Date(),
    };

    const result = await db
      .collection("tasks")
      .insertOne(newTask);

    const createdTask = {
      _id: result.insertedId,
      ...newTask,
    };

    res.status(201).json(createdTask);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
});


app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = new ObjectId(req.params.id);

    const result = await db.collection("tasks").updateOne(
      { _id: taskId },
      {
        $set: {
          completed: req.body.completed,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task updated successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = new ObjectId(req.params.id);

    const result = await db.collection("tasks").deleteOne({
      _id: taskId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});



const PORT = process.env.PORT || 5000;

connectToDatabase().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});