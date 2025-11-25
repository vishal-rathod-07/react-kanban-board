import { useCallback, useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Columns3, Plus, Search, X } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import ThemeToggle from '../ThemeToggle';
import { cn } from '../../lib/utils';

const KanbanBoard = ({ onTaskMove, columns: columnsData }) => {
  const [columns, setColumns] = useState({});
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState(() => ({
    name: '',
    column: columnsData?.[0]?.name || 'todo',
  }));
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    try {
      const state = localStorage.getItem('kanban-board-state');
      if (state) {
        const parsedState = JSON.parse(state);
        const nextColumns = {};
        columnsData.forEach((column) => {
          nextColumns[column.name] = parsedState[column.name] || [];
        });
        setColumns(nextColumns);
      } else {
        const initialColumns = {};
        columnsData.forEach((column) => {
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
      localStorage.setItem('kanban-board-state', JSON.stringify(columns));
    } catch (error) {
      console.error(error);
    }
  }, [columns]);

  const openCreateDialog = useCallback(
    (columnName) => {
      setEditingTask(null);
      setNewTask((prev) => ({
        name: '',
        column: columnName || prev.column || columnsData?.[0]?.name || 'todo',
      }));
      setDialogOpen(true);
    },
    [columnsData]
  );

  const openEditDialog = useCallback((task, columnName) => {
    setEditingTask({ task, columnName });
    setNewTask({
      name: task.name,
      column: columnName,
    });
    setDialogOpen(true);
  }, []);

  const handleDialogSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmedName = newTask.name.trim();
      if (!trimmedName) return;

      if (editingTask) {
        const { task, columnName: fromColumn } = editingTask;
        const toColumn = newTask.column;

        setColumns((prevColumns) => {
          const nextColumns = { ...prevColumns };
          if (!nextColumns[fromColumn]) {
            return prevColumns;
          }

          if (fromColumn === toColumn) {
            nextColumns[fromColumn] = nextColumns[fromColumn].map((t) =>
              t.id === task.id ? { ...t, name: trimmedName } : t
            );
          } else {
            const updatedTask = { ...task, name: trimmedName };
            nextColumns[fromColumn] = nextColumns[fromColumn].filter(
              (t) => t.id !== task.id
            );
            nextColumns[toColumn] = [...(nextColumns[toColumn] || []), updatedTask];

            if (onTaskMove) {
              onTaskMove(updatedTask, fromColumn, toColumn);
            }
          }

          return nextColumns;
        });
      } else {
        setColumns((prevColumns) => {
          const nextColumns = { ...prevColumns };
          const targetColumn = newTask.column || columnsData?.[0]?.name || 'todo';
          const createdTask = { name: trimmedName, id: Date.now() };

          nextColumns[targetColumn] = [...(nextColumns[targetColumn] || []), createdTask];

          return nextColumns;
        });
      }

      setDialogOpen(false);
      setEditingTask(null);
      setNewTask((prev) => ({
        name: '',
        column: prev.column,
      }));
    },
    [editingTask, newTask, onTaskMove, columnsData]
  );

  const moveTaskFromColumn = useCallback(
    (task, to) => {
      setColumns((prevColumns) => {
        const from = Object.keys(prevColumns).find((key) =>
          prevColumns[key].includes(task)
        );
        if (!from || from === to) return prevColumns;

        const nextColumns = { ...prevColumns };
        nextColumns[from] = nextColumns[from].filter((t) => t !== task);
        nextColumns[to] = [...(nextColumns[to] || []), task];

        if (onTaskMove) {
          onTaskMove(task, from, to);
        }

        return nextColumns;
      });
    },
    [onTaskMove]
  );

  const deleteTask = useCallback((task, columnName) => {
    setColumns((prevColumns) => {
      const nextColumns = { ...prevColumns };
      nextColumns[columnName] = (nextColumns[columnName] || []).filter(
        (t) => t !== task
      );
      return nextColumns;
    });
  }, []);

  const filteredColumns = columnsData.map((col) => {
    const tasks = columns[col.name] || [];
    const filteredTasks = search
      ? tasks.filter((task) =>
          task.name.toLowerCase().includes(search.toLowerCase())
        )
      : tasks;

    return { ...col, tasks: filteredTasks };
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="border-b bg-background/80 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-3 md:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
                <Columns3 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight sm:text-base">
                  Kanban Pro
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  Drag and drop tasks across columns
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden w-40 sm:block md:w-64">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks…"
                    className="h-9 pl-8"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="gap-1"
                onClick={() => openCreateDialog()}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New task</span>
                <span className="sm:hidden">New</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-x-auto px-3 py-3 md:px-6 md:py-4">
            <div className="flex w-full gap-3 md:gap-4">
              {filteredColumns.map((col) => (
                <Column
                  key={col.name}
                  title={col.title}
                  columnName={col.name}
                  tasks={col.tasks}
                  onAddTask={openCreateDialog}
                  onEditTask={openEditDialog}
                  onDeleteTask={deleteTask}
                  moveTaskFromColumn={moveTaskFromColumn}
                />
              ))}
            </div>
          </div>
        </main>

        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          columns={columnsData}
          newTask={newTask}
          setNewTask={setNewTask}
          onSubmit={handleDialogSubmit}
          isEditing={Boolean(editingTask)}
        />
      </div>
    </DndProvider>
  );
};

function Column({
  title,
  columnName,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  moveTaskFromColumn,
}) {
  const [, drop] = useDrop({
    accept: 'task',
    drop: (item) => {
      if (item.from !== columnName) {
        moveTaskFromColumn(item.task, columnName);
      }
    },
  });

  const count = tasks?.length || 0;

  return (
    <Card className="flex w-[260px] flex-shrink-0 flex-col bg-muted/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {count} task{count !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAddTask(columnName)}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 px-2 pb-2">
        <ScrollArea className="h-[calc(100vh-10rem)] pr-2">
          <div ref={drop} className="flex flex-col gap-2 pb-2">
            {tasks?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                columnName={columnName}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
            {!tasks || tasks.length === 0 ? (
              <p className="mt-1 text-xs italic text-muted-foreground">
                No tasks yet
              </p>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TaskCard({ task, columnName, onEditTask, onDeleteTask }) {
  const [, drag] = useDrag({
    type: 'task',
    item: { task, from: columnName },
  });

  return (
    <div
      ref={drag}
      className={cn(
        'group relative rounded-md border bg-card p-3 text-left shadow-sm transition-all',
        'hover:border-primary/60 hover:shadow-md'
      )}
    >
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onEditTask(task, columnName)}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="line-clamp-2 text-sm font-medium">{task.name}</p>
          </div>
        </div>
      </button>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
          Task
        </Badge>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow group-hover:flex"
        onClick={() => onDeleteTask(task, columnName)}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Delete task</span>
      </Button>
    </div>
  );
}

function TaskDialog({
  open,
  onOpenChange,
  columns,
  newTask,
  setNewTask,
  onSubmit,
  isEditing,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit task' : 'Create task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of this task.'
              : 'Add a new task to your board.'}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 px-6 pb-6 pt-2" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="task-title">
              Title
            </label>
            <Input
              id="task-title"
              placeholder="Write task title"
              value={newTask.name}
              onChange={(event) =>
                setNewTask((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="task-column">
              Column
            </label>
            <select
              id="task-column"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={newTask.column}
              onChange={(event) =>
                setNewTask((prev) => ({
                  ...prev,
                  column: event.target.value,
                }))
              }
            >
              {columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save changes' : 'Create task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default KanbanBoard;
