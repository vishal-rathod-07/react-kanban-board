import React, { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

import "./board.css";

const KanbanBoard = ({ onTaskMove, columns: columnsData }) => {
  const [columns, setColumns] = useState({});

  const [newTask, setNewTask] = useState({ name: "", column: "todo" });

  useEffect(() => {
    try {
      const state = localStorage.getItem("kanban-board-state");
      if (state) {
        const parsedState = JSON.parse(state);
        const columns = {};
        columnsData.forEach(column => {
          columns[column.name] = parsedState[column.name] || [];
        });
        setColumns(columns);
      } else {
        // initialize columns with empty arrays
        const initialColumns = {};
        columnsData.forEach(column => {
          initialColumns[column.name] = [];
        });
        setColumns(initialColumns);
      }
    } catch (error) {
      console.error(error);
    }

    
  }, [columnsData]);

  useEffect(() => {
    try {
      localStorage.setItem("kanban-board-state", JSON.stringify(columns));
    } catch (error) {
      console.error(error);
    }
  }, [columns]);

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
        <h2 className="column-heading">{title}</h2>
        <div className="task-list" ref={drop}>
          {tasks?.map(task => (
            <Task task={task} key={task.id} column={columnName} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <h1 className="app-title">Kanban Pro</h1>
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
              {
                columnsData.map(col => (
                  <option key={col.name} value={col.name}>{col.title}</option>
                ))
              }
            </select>
          </label>
          <button type="submit">Add Task</button>
        </form>
      <div className="kanban-board">
      {columnsData.map(col => (
        <Column
          key={col.name}
          title={col.title}
          tasks={columns[col.name]}
          columnName={col.name}
        />
      ))}
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
