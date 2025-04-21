import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { LangProvider } from './lib/LangContext';
import Header from './components/Header';
import Home from './views/Home';
import Firegate from './views/Firegate';
import Aeolus from './views/Aeolus';
import NovaKey from './views/NovaKey';
import Manifesto from './views/Manifesto';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

// Layout for pages with header and main spacing
function Layout() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <LangProvider>
      <div className="flex flex-col h-screen relative">
        <div className="bg-gradient-to-b from-amber-100 via-orange-50 to-white absolute inset-0 -z-10" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="manifesto" element={<Manifesto />} />
          <Route element={<Layout />}>
            <Route path="firegate" element={<Firegate />} />
            <Route path="aeolus" element={<Aeolus />} />
            <Route path="nova-key" element={<NovaKey />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
        <Analytics />
      </div>
    </LangProvider>
  );
}

export default App;
