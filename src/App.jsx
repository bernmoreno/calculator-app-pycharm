import { useState } from 'react'
import './App.css'

const buttons = [
  ['clear', 'sign', 'percent', 'divide'],
  ['7', '8', '9', 'multiply'],
  ['4', '5', '6', 'subtract'],
  ['1', '2', '3', 'add'],
  ['0', 'decimal', 'delete', 'equals'],
]

const labels = {
  clear: 'AC',
  sign: '+/-',
  percent: '%',
  divide: '/',
  multiply: 'x',
  subtract: '-',
  add: '+',
  decimal: '.',
  delete: 'DEL',
  equals: '=',
}

const operators = {
  divide: '/',
  multiply: 'x',
  subtract: '-',
  add: '+',
}

function formatValue(value) {
  if (value === 'Error') {
    return value
  }

  const [whole, fraction] = value.split('.')
  const formattedWhole = Number(whole).toLocaleString('en-US')

  if (fraction === undefined) {
    return formattedWhole
  }

  return `${formattedWhole}.${fraction}`
}

function calculate(firstValue, secondValue, operator) {
  const a = Number(firstValue)
  const b = Number(secondValue)

  if (operator === 'add') return a + b
  if (operator === 'subtract') return a - b
  if (operator === 'multiply') return a * b
  if (operator === 'divide') {
    if (b === 0) return 'Error'
    return a / b
  }

  return b
}

function App() {
  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState(null)
  const [pendingOperator, setPendingOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  function inputDigit(digit) {
    if (display === 'Error') {
      setDisplay(digit)
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
      return
    }

    setDisplay((current) => (current === '0' ? digit : `${current}${digit}`))
  }

  function inputDecimal() {
    if (display === 'Error') {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }

    if (!display.includes('.')) {
      setDisplay((current) => `${current}.`)
    }
  }

  function resetCalculator() {
    setDisplay('0')
    setStoredValue(null)
    setPendingOperator(null)
    setWaitingForOperand(false)
  }

  function deleteLastDigit() {
    if (display === 'Error') {
      resetCalculator()
      return
    }

    if (waitingForOperand) {
      return
    }

    setDisplay((current) => {
      if (current.length === 1 || (current.length === 2 && current.startsWith('-'))) {
        return '0'
      }

      return current.slice(0, -1)
    })
  }

  function toggleSign() {
    if (display === '0' || display === 'Error') {
      return
    }

    setDisplay((current) => (current.startsWith('-') ? current.slice(1) : `-${current}`))
  }

  function convertToPercent() {
    if (display === 'Error') {
      return
    }

    setDisplay(String(Number(display) / 100))
  }

  function performCalculation(nextOperator) {
    if (display === 'Error') {
      return
    }

    if (storedValue === null) {
      setStoredValue(display)
      setPendingOperator(nextOperator)
      setWaitingForOperand(true)
      return
    }

    if (waitingForOperand) {
      setPendingOperator(nextOperator)
      return
    }

    const result = calculate(storedValue, display, pendingOperator)
    const normalizedResult =
      result === 'Error' ? 'Error' : String(Number.parseFloat(result.toFixed(10)))

    setDisplay(normalizedResult)
    setStoredValue(normalizedResult === 'Error' ? null : normalizedResult)
    setPendingOperator(nextOperator)
    setWaitingForOperand(true)
  }

  function handleButtonPress(key) {
    if (/^\d$/.test(key)) {
      inputDigit(key)
      return
    }

    if (key === 'decimal') {
      inputDecimal()
      return
    }

    if (key === 'clear') {
      resetCalculator()
      return
    }

    if (key === 'delete') {
      deleteLastDigit()
      return
    }

    if (key === 'sign') {
      toggleSign()
      return
    }

    if (key === 'percent') {
      convertToPercent()
      return
    }

    if (key === 'equals') {
      if (pendingOperator && storedValue !== null && !waitingForOperand) {
        performCalculation(null)
      }
      return
    }

    performCalculation(key)
  }

  const activeOperator = pendingOperator ? operators[pendingOperator] : null
  const expression = storedValue && activeOperator ? `${formatValue(storedValue)} ${activeOperator}` : 'Ready'

  return (
    <main className="app-shell">
      <section className="calculator" aria-label="Calculator">
        <div className="calculator__header">
          <p className="eyebrow">React Calculator</p>
          <h1>Calculator</h1>
        </div>

        <div className="display" role="status" aria-live="polite">
          <span className="display__expression">{expression}</span>
          <strong className="display__value">{formatValue(display)}</strong>
        </div>

        <div className="keypad">
          {buttons.flat().map((key) => {
            const classNames = ['key']

            if (['clear', 'sign', 'percent', 'delete'].includes(key)) {
              classNames.push('key--utility')
            }

            if (['divide', 'multiply', 'subtract', 'add', 'equals'].includes(key)) {
              classNames.push('key--operator')
            }

            if (key === '0') {
              classNames.push('key--zero')
            }

            return (
              <button
                key={key}
                type="button"
                className={classNames.join(' ')}
                onClick={() => handleButtonPress(key)}
              >
                {labels[key] ?? key}
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default App
