import './App.css';
import KanbanBoard from './components/board';

function App() {
  const columns = [
    { name: 'todo', title: 'To Do' },
    { name: 'in-progress', title: 'In Progress' },
    { name: 'done', title: 'Done' },
    { name: 'archive', title: 'Archive' },
  ];

  const handleTaskMove = (task, from, to) => {
    console.log(`Task ${task.name} moved from ${from} to ${to}`);
  };

  return <KanbanBoard onTaskMove={handleTaskMove} columns={columns} />;
}

export default App;
