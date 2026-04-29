import { useState } from 'react'

import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface TypedConfirmModalProps {
  open: boolean
  title: string
  description: string
  requiredText: string
  inputLabel: string
  confirmLabel: string
  cancelLabel?: string
  warningText?: string
  isConfirming?: boolean
  onConfirm: () => void
  onClose: () => void
}

interface TypedConfirmModalBodyProps extends Omit<TypedConfirmModalProps, 'open' | 'title' | 'description' | 'onClose'> {
  closeSafely: () => void
}

export function TypedConfirmModal({
  open,
  title,
  description,
  requiredText,
  inputLabel,
  confirmLabel,
  cancelLabel = 'Zrušiť',
  warningText = 'Táto akcia je trvalá. Pokračuj iba vtedy, keď máš čerstvú lokálnu zálohu.',
  isConfirming = false,
  onConfirm,
  onClose,
}: TypedConfirmModalProps) {
  const closeSafely = () => {
    if (!isConfirming) {
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={closeSafely} title={title} description={description} className="border border-rose-500/30 bg-black text-fitness-warm dark:bg-black">
      {open ? (
        <TypedConfirmModalBody
          requiredText={requiredText}
          inputLabel={inputLabel}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          warningText={warningText}
          isConfirming={isConfirming}
          onConfirm={onConfirm}
          closeSafely={closeSafely}
        />
      ) : null}
    </Modal>
  )
}

function TypedConfirmModalBody({
  requiredText,
  inputLabel,
  confirmLabel,
  cancelLabel = 'Zrušiť',
  warningText = 'Táto akcia je trvalá. Pokračuj iba vtedy, keď máš čerstvú lokálnu zálohu.',
  isConfirming = false,
  onConfirm,
  closeSafely,
}: TypedConfirmModalBodyProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const isConfirmed = confirmationText === requiredText

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        if (isConfirmed && !isConfirming) {
          onConfirm()
        }
      }}
    >
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
        <AlertTriangle className="mr-2 inline size-4" />{warningText}
      </div>
      <label className="block text-xs font-black uppercase tracking-[0.18em] text-fitness-yellow/70">
        {inputLabel}
        <span className="mt-2 block text-sm normal-case tracking-normal text-fitness-warm/70">
          Napíš presne <code className="rounded-lg border border-fitness-yellow/25 bg-black px-2 py-1 font-mono text-fitness-yellow">{requiredText}</code>.
        </span>
        <input
          aria-label={inputLabel}
          className="mt-3 w-full rounded-2xl border border-fitness-yellow/30 bg-black px-4 py-3 font-mono text-sm text-fitness-warm outline-none transition focus:border-fitness-yellow disabled:opacity-60"
          value={confirmationText}
          onInput={(event) => setConfirmationText(event.currentTarget.value)}
          disabled={isConfirming}
          autoComplete="off"
          spellCheck={false}
          data-modal-initial-focus
        />
      </label>
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={closeSafely} disabled={isConfirming}>
          {cancelLabel}
        </Button>
        <Button type="submit" variant="danger" leadingIcon={<AlertTriangle className="size-4" />} disabled={!isConfirmed || isConfirming}>
          {confirmLabel}
        </Button>
      </div>
    </form>
  )
}
