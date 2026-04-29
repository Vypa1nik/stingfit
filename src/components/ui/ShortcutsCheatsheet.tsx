import { Keyboard } from 'lucide-react'

import { Modal } from '@/components/ui/Modal'
import { SHORTCUTS } from '@/lib/shortcuts'
import { useUiStore } from '@/lib/uiStore'

const GROUP_ORDER = ['Global', 'Create', 'Navigate'] as const

export function ShortcutsCheatsheet() {
  const isOpen = useUiStore((state) => state.isShortcutsCheatsheetOpen)
  const setOpen = useUiStore((state) => state.setShortcutsCheatsheetOpen)

  const groupedShortcuts = GROUP_ORDER.map((group) => ({
    group,
    shortcuts: SHORTCUTS.filter((shortcut) => shortcut.group === group),
  })).filter((entry) => entry.shortcuts.length > 0)

  return (
    <Modal
      open={isOpen}
      onClose={() => setOpen(false)}
      title="Klávesové skratky"
      description="Rýchly prehľad najkratších ciest v StingFit."
      className="max-w-3xl"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
          <div className="inline-flex size-10 items-center justify-center rounded-lg bg-accent-light text-accent dark:bg-accent-dark/20 dark:text-blue-200">
            <Keyboard className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Tip</p>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              Stlač <span className="font-semibold text-text-primary dark:text-text-primary-dark">?</span> kedykoľvek mimo textových polí a znovu otvoríš tento prehľad.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {groupedShortcuts.map(({ group, shortcuts }) => (
            <section key={group} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted dark:text-text-muted-dark">{formatShortcutGroup(group)}</h3>
              <div className="overflow-hidden rounded-xl border border-border dark:border-border-dark">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">{formatShortcutGroup(group)} klávesové skratky</caption>
                  <thead className="bg-black/5 dark:bg-white/5">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted dark:text-text-muted-dark">
                        Akcia
                      </th>
                      <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted dark:text-text-muted-dark">
                        Popis
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-[0.12em] text-text-muted dark:text-text-muted-dark">
                        Klávesy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortcuts.map((shortcut) => (
                      <tr key={shortcut.label} className="border-b border-border last:border-b-0 dark:border-border-dark">
                        <th scope="row" className="px-4 py-3 text-left font-medium text-text-primary dark:text-text-primary-dark">
                          {shortcut.label}
                        </th>
                        <td className="px-4 py-3 text-text-secondary dark:text-text-secondary-dark">{shortcut.description}</td>
                        <td className="px-4 py-3 text-right text-text-secondary dark:text-text-secondary-dark">
                          <span className="inline-flex rounded-md border border-border px-2 py-1 text-xs font-medium dark:border-border-dark">
                            {shortcut.keys}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </Modal>
  )
}

function formatShortcutGroup(group: string) {
  if (group === 'Global') return 'Globálne'
  if (group === 'Create') return 'Vytvorenie'
  if (group === 'Navigate') return 'Navigácia'
  return group
}
