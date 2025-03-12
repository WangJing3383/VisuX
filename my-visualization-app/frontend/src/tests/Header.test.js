import React from 'react';
import { render, screen } from '@testing-library/react';
import HeaderNav from '../components/homepage/Header';

// Mock the dependent modules
jest.mock('../components/file/FileComponent', () => () => (
  <div data-testid="mock-file">Mocked FileComponent</div>
));


describe('HeaderNav', () => {
  let uiControllerMock;

  // Create a new instance of UIController before each test
  beforeEach(() => {
    uiControllerMock = { uiControllerAction: jest.fn() };
    jest.clearAllMocks();
  });

  test('should render HeaderNav correctly', () => {
    render(<HeaderNav uiController={uiControllerMock} />);

    expect(screen.getByText('Visux')).toBeInTheDocument();
    expect(screen.getByTestId('header-nav')).toBeInTheDocument();
  });

  test('should have the correct styles applied to Header', () => {
    render(<HeaderNav uiController={uiControllerMock} />);

    //Check if the header has correct styles
    const headerElement = screen.getByRole('banner') || screen.getByTagName('header');
    expect(headerElement).toHaveStyle('background: #fff');
    expect(headerElement).toHaveStyle('padding: 0 20px');
  });

  test('should render FileComponent inside HeaderNav', () => {
    render(<HeaderNav uiController={uiControllerMock} />);

    //Check if FileComponent was mounted
    expect(screen.getByTestId('mock-file')).toBeInTheDocument();
  });
});
