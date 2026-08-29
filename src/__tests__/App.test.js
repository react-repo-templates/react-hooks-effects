import { render, cleanup, screen } from '@testing-library/react';
import App from '../App';

describe('Test suite for item "state-event"', () => {
  
  afterEach(cleanup);

  it('should render a div element', () => {
    const { container } = render(<App />);
    const divElements = container.getElementsByTagName('div');
    expect(divElements.length).toBeGreaterThan(0);
  });

  describe('retrieving data from localStorage', () => {

    const testCases = ['05RndrgxtJjOEdx', 'j1r14lkQeU2I', 'MPlnw80fk8'];

    afterEach(() => {
      localStorage.clear();
    });

    test.each(testCases)('Renders the component with appData %p from localStorage in the input', (testCase) => {
      
      localStorage.setItem('appData', testCase);
      render(<App />);
      
      const inputElement = screen.getByDisplayValue(testCase);
      expect(inputElement).toBeInTheDocument();
    });

  });

});
