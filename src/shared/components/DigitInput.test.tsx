import { useState } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import i18n from '../i18n'
import { DigitInput } from './DigitInput'

function Harness({ error = null }: { error?: string | null }) {
  const [value, setValue] = useState('')
  return <DigitInput id="answer" label="Escribe el resto" value={value} onValueChange={setValue} error={error} />
}

beforeEach(async () => {
  cleanup()
  await i18n.changeLanguage('es')
})

describe('DigitInput con teclado en pantalla', () => {
  it('escribe con las teclas y borra la última cifra', () => {
    render(<Harness />)
    const input = screen.getByRole('textbox', { name: 'Escribe el resto' })
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '8' }))
    expect(input).toHaveValue('28')
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
    expect(input).toHaveValue('2')
  })

  it('no abre el teclado del sistema en el móvil', () => {
    render(<Harness />)
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'none')
  })

  it('con error, la siguiente cifra sustituye a la respuesta equivocada', () => {
    render(<Harness error="Casi... inténtalo otra vez" />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '3' } })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Casi... inténtalo otra vez')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(input).toHaveValue('1')
  })
})
