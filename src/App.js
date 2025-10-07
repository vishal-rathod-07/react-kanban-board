import { useCallback } from 'react';
import KanbanBoard from './components/board';

import './App.css';

const columns = [
  { name: 'todo', title: 'To Do' },
  { name: 'in-progress', title: 'In Progress' },
  { name: 'done', title: 'Done' },
  { name: 'archive', title: 'Archive' },
];

function App() {
  const handleTaskMove = useCallback((task, from, to) => {
    console.log(`Task ${task.name} moved from ${from} to ${to}`);
  }, []);

  return <KanbanBoard onTaskMove={handleTaskMove} columns={columns} />;
}

export default App;
