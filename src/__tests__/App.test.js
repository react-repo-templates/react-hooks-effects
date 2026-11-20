import fs from 'fs';
import path from 'path';
import { render, cleanup, screen } from '@testing-library/react';
import App from '../App';

const appSourcePath = path.join(__dirname, '../App.jsx');

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function useEffectCallbacks(source) {
  const callbacks = [];
  const token = 'useEffect(';
  let from = 0;

  while (from < source.length) {
    const start = source.indexOf(token, from);
    if (start === -1) break;

    let depth = 0;
    let quote = null;
    const argStart = start + token.length;

    for (let i = argStart; i < source.length; i++) {
      const char = source[i];

      if (quote) {
        if (char === '\\') {
          i += 1;
        } else if (char === quote) {
          quote = null;
        }
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        quote = char;
        continue;
      }

      if (char === '(' || char === '{' || char === '[') {
        depth += 1;
        continue;
      }

      if (char === ')' || char === '}' || char === ']') {
        if (depth === 0 && char === ')') {
          callbacks.push(source.slice(argStart, i));
          from = i + 1;
          break;
        }
        depth -= 1;
        continue;
      }

      if (char === ',' && depth === 0) {
        callbacks.push(source.slice(argStart, i));
        from = i + 1;
        break;
      }
    }

    if (from <= start) break;
  }

  return callbacks;
}

describe('Test suite for item "hooks"', () => {

  afterEach(cleanup);

  it('should render a div element', () => {
    const { container } = render(<App />);
    const divElements = container.getElementsByTagName('div');
    expect(divElements.length).toBeGreaterThan(0);
  });

  it('reads appData from localStorage inside useEffect', () => {
    const source = stripComments(fs.readFileSync(appSourcePath, 'utf8'));
    const callbacks = useEffectCallbacks(source);

    expect(callbacks).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/localStorage\.getItem\(\s*['"`]appData['"`]\s*\)/),
      ]),
    );
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
