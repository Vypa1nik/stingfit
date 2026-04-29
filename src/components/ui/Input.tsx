import { forwardRef } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const inputBase =
  'w-full rounded border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted focus:border-accent dark:border-border-dark dark:bg-[#181818] dark:text-text-primary-dark dark:placeholder:text-text-muted-dark'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputBase, className)} {...props} />
  ),
)

Input.displayName = 'Input'

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(inputBase, 'min-h-[140px] resize-y', className)} {...props} />
  ),
)

TextArea.displayName = 'TextArea'
