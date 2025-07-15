import React, { useState, useEffect } from 'react';
import './Calculator.scss';

// Safe calculation function using math expression parser
const calculate = (expression: string): string => {
  try {
    if (!expression.trim()) return '0';
    
    // Sanitize input - only allow numbers, operators, and parentheses
    const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
    
    // Use Function constructor as safer alternative to eval
    // Note: For production, consider a proper parser library like mathjs
    const fn = new Function(`return ${sanitized}`);
    const result = fn();
    
    // Handle division by zero and other math errors
    if (!isFinite(result)) throw new Error('Math error');
    
    return result.toString();
  } catch (error) {
    return 'Error';
  }
};

const Calculator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      setResult(calculate(input));
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === '⌫') {
      setInput((prev) => prev.slice(0, -1));
    } else {
      // Prevent multiple decimal points in a number
      if (value === '.') {
        const parts = input.split(/[-+*/]/);
        if (parts[parts.length - 1].includes('.')) {
          return;
        }
      }
      setInput((prev) => prev + value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      const allowedKeys = /[0-9+\-*/.=]|Enter|Backspace|Delete|\(|\)/;
      
      if (allowedKeys.test(key)) {
        event.preventDefault();
        if (key === 'Enter' || key === '=') {
          handleButtonClick('=');
        } else if (key === 'Backspace') {
          handleButtonClick('⌫');
        } else if (key === 'Delete') {
          handleButtonClick('C');
        } else {
          handleButtonClick(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  const buttonRows = [
    ['7', '8', '9', '/', '('],
    ['4', '5', '6', '*', ')'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
    ['C', '⌫']
  ];

  return (
    <div className="calculator-container">
      <div className="calculator-paper">
        <h1 className="calculator-title">Calculator</h1>

        {/* Display */}
        <div className="calculator-display">
          <div className="calculator-input">{input || '0'}</div>
          <div className="calculator-result">{result}</div>
        </div>

        {/* Buttons */}
        <div className="calculator-buttons">
          {buttonRows.map((row, rowIndex) => (
            <div key={rowIndex} className="calculator-button-row">
              {row.map((button) => (
                <button
                  key={button}
                  className={`
                    calculator-button 
                    ${button === 'C' ? 'clear-button' : ''}
                    ${button === '=' ? 'equals-button' : ''}
                    ${button === '⌫' ? 'backspace-button' : ''}
                    ${['/', '*', '-', '+', '(', ')'].includes(button) ? 'operator-button' : ''}
                  `}
                  onClick={() => handleButtonClick(button)}
                >
                  {button}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculator;