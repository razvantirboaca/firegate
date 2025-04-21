import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LangProvider } from './lib/LangContext';
import Header from './components/Header';
import Home from './views/Home';
import Firegate from './views/Firegate';
import Aeolus from './views/Aeolus';
import NovaKey from './views/NovaKey';
import { Toaster } from 'sonner';

function App() {
  return (
    <LangProvider>
      <div className="flex flex-col h-screen relative">
        <div className="bg-gradient-to-b from-amber-100 via-orange-50 to-white absolute inset-0 -z-10" />
        <Header />
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/firegate" element={<Firegate />} />
            <Route path="/aeolus" element={<Aeolus />} />
            <Route path="/nova-key" element={<NovaKey />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </LangProvider>
  );
}

export default App;
