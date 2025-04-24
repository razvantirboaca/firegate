import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Firegate from '.';
import translations from '@shared/i18n';

// Mock Firebase Firestore functions to prevent real database interactions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: () => () => {},
}));
// Mock the Firebase database instance
vi.mock('@shared/firebase', () => ({ db: {} }));
// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Firegate component', () => {
  it('renders header, textarea, and send button', () => {
    render(<Firegate />);
    // Header should include the Nova interface title
    expect(screen.getByText(/Nova Interface/)).toBeInTheDocument();
    // Textarea placeholder should match translation
    expect(
      screen.getByPlaceholderText(translations.en.speakPlaceholder)
    ).toBeInTheDocument();
    // Send button should be enabled by default
    const sendButton = screen.getByRole('button', { name: translations.en.send });
    expect(sendButton).toBeEnabled();
  });
});