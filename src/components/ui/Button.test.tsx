import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Button } from './Button'
import React from 'react'

test('renders button with correct text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
