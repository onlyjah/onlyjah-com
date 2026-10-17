import { Dialog as Primitive } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'
export const Dialog = Primitive.Root
export const DialogTrigger = Primitive.Trigger
export const DialogClose = Primitive.Close
export const DialogTitle = Primitive.Title
export const DialogDescription = Primitive.Description
export function DialogContent({ children, className, backdropClassName }: {
  children: ReactNode; className?: string; backdropClassName?: string
}) {
  return <Primitive.Portal><Primitive.Backdrop className={backdropClassName} /><Primitive.Popup className={className}>{children}</Primitive.Popup></Primitive.Portal>
}
