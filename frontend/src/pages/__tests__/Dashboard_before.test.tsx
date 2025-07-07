/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// Import component nguyên gốc
import Dashboard_before from '../Dashboard_before';
// Alias lại với tên PascalCase cho test
const DashboardBefore = Dashboard_before;

// Mock các components để test isolation
jest.mock('../../components/HeroCommunicate', () => {
  return function MockHeroCommunicate() {
    return <div data-testid="hero-communicate">Hero Communicate</div>;
  };
});

jest.mock('../../components/HeroProjectManagement', () => {
  return function MockHeroProjectManagement() {
    return <div data-testid="hero-project-management">Hero Project Management</div>;
  };
});

jest.mock('../../components/HeroIdeatocompletion', () => {
  return function MockHeroIdeatocompletion() {
    return <div data-testid="hero-idea-completion">Hero Idea to Completion</div>;
  };
});

jest.mock('../../components/HeroGantt', () => {
  return function MockHeroGantt() {
    return <div data-testid="hero-gantt">Hero Gantt</div>;
  };
});

jest.mock('../../components/HeroAI_Assistant', () => {
  return function MockHeroAIAssistant() {
    return <div data-testid="hero-ai-assistant">Hero AI Assistant</div>;
  };
});

jest.mock('../../components/HerroDocument_Manager', () => {
  return function MockHeroDocumentManager() {
    return <div data-testid="hero-document-manager">Hero Document Manager</div>;
  };
});

jest.mock('../../components/HeroPricing', () => {
  return function MockHeroPricing() {
    return <div data-testid="hero-pricing">Hero Pricing</div>;
  };
});

jest.mock('../../components/HeroBanner', () => {
  return function MockHeroBanner() {
    return <div data-testid="hero-banner">Hero Banner</div>;
  };
});

jest.mock('../../components/HeroOverview', () => {
  return function MockHeroOverview() {
    return <div data-testid="hero-overview">Hero Overview</div>;
  };
});

jest.mock('../../components/TopButton', () => {
  return function MockTopButton() {
    return <div data-testid="top-button">Top Button</div>;
  };
});

jest.mock('../../components/Footer', () => {
  return function MockFooter({ onFooterClick }: { onFooterClick: (item: string) => void }) {
    return (
      <div data-testid="footer">
        <button onClick={() => onFooterClick('test-item')}>Footer Item</button>
      </div>
    );
  };
});

jest.mock('../../components/Before/Header_before', () => {
  return function MockHeaderBefore({ onNavigate }: { onNavigate: (section: string) => void }) {
    return (
      <div data-testid="header-before">
        <button onClick={() => onNavigate('ai-assistant')} data-testid="nav-ai-assistant">
          AI Assistant
        </button>
        <button onClick={() => onNavigate('project-management')} data-testid="nav-project-management">
          Project Management
        </button>
        <button onClick={() => onNavigate('communicate')} data-testid="nav-communicate">
          Communicate
        </button>
      </div>
    );
  };
});

jest.mock('../../components/ScrollTrigger', () => {
  return function MockScrollTrigger({ children }: { children: React.ReactNode }) {
    return <div data-testid="scroll-trigger">{children}</div>;
  };
});

describe('DashboardBefore Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<DashboardBefore />);
    expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
  });

  test('renders all hero sections', () => {
    render(<DashboardBefore />);
    
    expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
    expect(screen.getByTestId('hero-overview')).toBeInTheDocument();
    expect(screen.getByTestId('hero-project-management')).toBeInTheDocument();
    expect(screen.getByTestId('hero-communicate')).toBeInTheDocument();
    expect(screen.getByTestId('hero-idea-completion')).toBeInTheDocument();
    expect(screen.getByTestId('hero-gantt')).toBeInTheDocument();
    expect(screen.getByTestId('hero-ai-assistant')).toBeInTheDocument();
    expect(screen.getByTestId('hero-document-manager')).toBeInTheDocument();
    expect(screen.getByTestId('hero-pricing')).toBeInTheDocument();
  });

  test('renders header and footer components', () => {
    render(<DashboardBefore />);
    
    expect(screen.getByTestId('header-before')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('top-button')).toBeInTheDocument();
  });

  test('header navigation works correctly', () => {
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    render(<DashboardBefore />);
    
    const aiAssistantButton = screen.getByTestId('nav-ai-assistant');
    fireEvent.click(aiAssistantButton);
    
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });

  test('scroll trigger components wrap content correctly', () => {
    render(<DashboardBefore />);
    
    const scrollTriggers = screen.getAllByTestId('scroll-trigger');
    expect(scrollTriggers.length).toBeGreaterThan(0);
  });

  test('all navigation sections can be scrolled to', () => {
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    render(<DashboardBefore />);
    
    // Test different navigation options
    const projectManagementButton = screen.getByTestId('nav-project-management');
    const communicateButton = screen.getByTestId('nav-communicate');
    
    fireEvent.click(projectManagementButton);
    fireEvent.click(communicateButton);
    
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
  });

  test('footer click handler is called correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<DashboardBefore />);
    
    const footerButton = screen.getByText('Footer Item');
    fireEvent.click(footerButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Đã click vào test-item');
    
    consoleSpy.mockRestore();
  });
});