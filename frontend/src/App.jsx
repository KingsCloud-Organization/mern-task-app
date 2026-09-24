import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // GET tasks
  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  // POST task
  async function addTask(event) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: title,
        }),
      });

      const newTask = await response.json();

      setTasks((currentTasks) => [
        ...currentTasks,
        newTask,
      ]);

      setTitle("");

    } catch (error) {
      console.error("Error adding task:", error);
    }
  }

  // PATCH task
  async function toggleTask(task) {
    try {
      await fetch(`${API_URL}/${task._id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === task._id
            ? {
                ...currentTask,
                completed: !currentTask.completed,
              }
            : currentTask
        )
      );

    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  // DELETE task
  async function deleteTask(id) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== id)
      );

    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  return (
    <div>
      <h1>My Tasks</h1>

      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Enter a task"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
        />

        <button type="submit">
          Add Task
        </button>
      </form>

      <h2>Task List</h2>

      {tasks.map((task) => (
        <div key={task._id}>
          <span>
            {task.completed ? "✅" : "⬜"}{" "}
            {task.title}
          </span>

          <button onClick={() => toggleTask(task)}>
            {task.completed ? "Undo" : "Complete"}
          </button>

          <button onClick={() => deleteTask(task._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;