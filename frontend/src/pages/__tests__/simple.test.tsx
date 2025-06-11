import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Simple Test Suite', () => {
  it('should verify Jest configuration', () => {
    expect(1 + 1).toBe(2);
  });

  it('should render a simple component', () => {
    const TestComponent = () => <div data-testid="test-element">Hello Test</div>;
    render(<TestComponent />);
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
  });
});
