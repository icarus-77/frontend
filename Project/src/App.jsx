import React, { useState } from 'react';
import { ScrollStory } from './components/ScrollStory';
import { Board } from './components/Board';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');

  return (
    <main className="w-full min-h-screen bg-slate-950 text-slate-100">
      {currentView === 'landing' ? (
        <ScrollStory onEnterBoard={() => setCurrentView('board')} />
      ) : (
        <Board onBackToStory={() => setCurrentView('landing')} />
      )}
    </main>
  );
}

