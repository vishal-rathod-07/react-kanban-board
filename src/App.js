import './App.css';
import KanbanBoard from './components/board';

function App() {
  return (
    <KanbanBoard 
      onTaskMove={(task, from, to) => {
        console.log(`Task ${task.name} moved from ${from} to ${to}`);
      }}
     />
  );
}

export default App;
