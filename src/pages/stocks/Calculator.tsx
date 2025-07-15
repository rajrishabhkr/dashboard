import React, { useState, useEffect } from 'react';
import './Calculator.scss';

const Calculator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      try {
        const calculatedResult = eval(input).toString();
        setResult(calculatedResult);
      } catch (error) {
        setResult('Error');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === '⌫') {
      setInput((prev) => prev.slice(0, -1));
    } else {
      setInput((prev) => prev + value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (/[0-9+\-*/.=]|Enter|Backspace/.test(key)) {
        event.preventDefault();
        if (key === 'Enter' || key === '=') {
          handleButtonClick('=');
        } else if (key === 'Backspace') {
          handleButtonClick('⌫');
        } else {
          handleButtonClick(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  const buttonRows = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
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
                    ${['/', '*', '-', '+'].includes(button) ? 'operator-button' : ''}
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