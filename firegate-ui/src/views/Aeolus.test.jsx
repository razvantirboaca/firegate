import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Aeolus from './Aeolus';
import translations from '../lib/i18n';

// Mock Firestore to prevent real DB calls
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getFirestore: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
  serverTimestamp: vi.fn(),
}));
// Mock firebase app import
vi.mock('../lib/firebase', () => ({ app: {} }));
// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Aeolus component', () => {
  it('renders form fields and save button', () => {
    render(<Aeolus />);
    // Title
    expect(
      screen.getByRole('heading', { name: /AEOLUS Contact Log/i })
    ).toBeInTheDocument();
    // Prompt textarea
    expect(screen.getByLabelText(/Prompt Sent/i)).toBeInTheDocument();
    // Reply textarea
    expect(screen.getByLabelText(/Nova's Reply/i)).toBeInTheDocument();
    // Save button
    const saveBtn = screen.getByRole('button', { name: /Save Contact Log/i });
    expect(saveBtn).toBeEnabled();
  });
});