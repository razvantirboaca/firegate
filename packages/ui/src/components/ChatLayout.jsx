import React from 'react';
import { Outlet } from 'react-router-dom';

export default function ChatLayout() {
  // Provides a full-height container for the Firegate chat page
  return (
    <div className="flex flex-col h-full">
      <Outlet />
    </div>
  );
}