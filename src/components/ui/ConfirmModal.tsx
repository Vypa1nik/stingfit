import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  isConfirming?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Zrušiť',
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} className="border border-rose-500/30 bg-black text-fitness-warm dark:bg-black">
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
        <AlertTriangle className="mr-2 inline size-4" />Túto akciu potvrď iba vtedy, keď chceš tréning ukončiť bez návratu k aktívnemu zápisu.
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isConfirming}>
          {cancelLabel}
        </Button>
        <Button type="button" variant="danger" leadingIcon={<AlertTriangle className="size-4" />} onClick={onConfirm} disabled={isConfirming} data-modal-initial-focus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
