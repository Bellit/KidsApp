import { useState } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal'
import i18n from '../i18n'

/** Contenedor mínimo: el botón que abre el modal debe poder recuperar el foco. */
function ModalHarness() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir diálogo
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Diálogo de prueba">
        <button type="button">Acción</button>
      </Modal>
    </div>
  )
}

describe('Modal (accesibilidad de teclado)', () => {
  beforeEach(async () => {
    cleanup()
    await i18n.changeLanguage('es')
  })

  it('recibe el foco al abrirse', () => {
    render(<ModalHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir diálogo' }))
    const dialog = screen.getByRole('dialog', { name: 'Diálogo de prueba' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveFocus()
  })

  it('cierra con Escape', () => {
    render(<ModalHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir diálogo' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('devuelve el foco al elemento que lo abrió al cerrar', () => {
    render(<ModalHarness />)
    const trigger = screen.getByRole('button', { name: 'Abrir diálogo' })
    // jsdom no enfoca al hacer click; en navegador real el click lo hace.
    trigger.focus()
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger).toHaveFocus()
  })

  it('atrapa el foco con Tab (no sale del diálogo)', () => {
    render(<ModalHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir diálogo' }))
    const dialog = screen.getByRole('dialog')
    const close = screen.getByRole('button', { name: 'Cerrar' })
    const action = screen.getByRole('button', { name: 'Acción' })

    // Desde el diálogo (foco inicial), Tab entra al primer control.
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(close).toHaveFocus()

    // Desde el último control, Tab rebota al primero.
    action.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(close).toHaveFocus()

    // Desde el primero, Shift+Tab rebota al último.
    close.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(action).toHaveFocus()

    expect(dialog.contains(document.activeElement)).toBe(true)
  })
})
