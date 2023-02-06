import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

import "./board.css";

const KanbanBoard = ({ onTaskMove }) => {
  const [columns, setColumns] = useState({
    todo: [],
    inProgress: [],
    done: []
  });

  const [newTask, setNewTask] = useState({ name: "", column: "todo" });

  const handleTaskChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value
    });
  };

  const handleColumnChange = (e) => {
    setNewTask({
      ...newTask,
      column: e.target.value
    });
  };

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.name) {
      setColumns(prevColumns => {
        const newColumns = {
          ...prevColumns,
          [newTask.column]: [...prevColumns[newTask.column], { name: newTask.name, id: Date.now() }]
        };
        setNewTask({ name: "", column: "todo" });
        return newColumns;
      });
    }
  };

  const moveTaskFromColumn = (task, to) => {
    setColumns(prevColumns => {
      const from = Object.keys(prevColumns).find(
        key => prevColumns[key].includes(task)
      );
      prevColumns[from] = prevColumns[from].filter(t => t !== task);
      prevColumns[to].push(task);
      if (onTaskMove) {
        onTaskMove(task, from, to);
      }
      return { ...prevColumns };
    });
  };

  const deleteTask = (task, columnName) => {
      setColumns(prevColumns => {
      prevColumns[columnName] = prevColumns[columnName].filter(t => t !== task);
        return { ...prevColumns };
      });
    };

  const Task = ({ task, column }) => {
    const [, drag] = useDrag({
      type: "task",
      item: { task, from: column },
        collect: monitor => ({
          isDragging: !!monitor.isDragging()
        })
      });
    return (
      <div className="task" ref={drag}>
        {task.name}
        <button className="btn-delete-task" onClick={() => deleteTask(task, column)}>X</button>
      </div>
    );
    };

  const Column = ({ title, tasks, columnName }) => {
    const [, drop] = useDrop({
      accept: "task",
      drop: item => {
        if (item.from !== columnName) {
          moveTaskFromColumn(item.task, columnName);
        }
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    });

    return (
      <div className="column">
        <h2>{title}</h2>
        <div className="task-list" ref={drop}>
          {tasks.map(task => (
            <Task task={task} key={task.id} column={columnName} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <form onSubmit={addTask}>
          <label>
            Task Name:
            <input
              type="text"
              name="name"
              value={newTask.name}
              onChange={handleTaskChange}
            />
          </label>
          <label>
            Column:
            <select value={newTask.column} onChange={handleColumnChange}>
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <button type="submit">Add Task</button>
        </form>
      <div className="kanban-board">
        <Column title="To Do" tasks={columns.todo} columnName="todo" />
        <Column title="In Progress" tasks={columns.inProgress} columnName="inProgress" />
        <Column title="Done" tasks={columns.done} columnName="done" />
        
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
