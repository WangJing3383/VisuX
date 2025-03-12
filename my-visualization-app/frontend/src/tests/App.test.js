// import { render, screen } from '@testing-library/react';
// import App from './App';

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock the useState hook for UIController
jest.mock('../components/UIController');

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = '';
  });

  test('renders the app with a header, sidebar, and content', () => {
    render(<App />);

    // Check if the Header component is rendered
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/Header Navigation/i)).toBeInTheDocument();
    
    // Check if the Sidebar component is rendered
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/Sidebar/i)).toBeInTheDocument();

    // Check if the LayoutContainer component is rendered
    expect(screen.getByText(/Layout Container/i)).toBeInTheDocument();
  });

  test('fetches CSRF token on mount and stores it in localStorage', async () => {
    // Mock fetch to return a sample CSRF token response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ csrfToken: 'test-csrf-token' }),
    });

    render(<App />);

    // Wait for useEffect to trigger CSRF fetch
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/get_csrf_token/', expect.any(Object)));

    // Check if CSRF token was saved in localStorage
    expect(localStorage.getItem('csrfToken')).toBe('test-csrf-token');
    // Also check if the cookie is set
    expect(document.cookie).toContain('csrftoken=test-csrf-token');
  });

  test('toggling sidebar state updates correctly', () => {
    render(<App />);

    // Initially, Sidebar should be visible
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Simulate clicking the button to hide the sidebar 
    fireEvent.click(screen.getByText(/Hide Sidebar/i));

    // After hiding, Sidebar should no longer be visible
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('toggling the showGraph state and rendering the graph window', () => {
    render(<App />);

    // Initially, the graph should be hidden
    expect(screen.queryByText(/Graph Window/i)).not.toBeInTheDocument(); 

    // Simulate toggling showGraph to true
    fireEvent.click(screen.getByText(/Show Graph/i));

    // Now, the graph should be visible
    expect(screen.getByText(/Graph Window/i)).toBeInTheDocument();
  });

  test('ModalCollection is rendered', () => {
    render(<App />);

    // Check if ModalCollection component is rendered
    expect(screen.getByText(/Modal Collection/i)).toBeInTheDocument(); // Assuming the ModalCollection has this text
  });
});
