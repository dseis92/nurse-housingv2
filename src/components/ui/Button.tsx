import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?:'primary'|'ghost'|'outline'; size?:'sm'|'md'|'lg' }
export function Button({variant='primary',size='md',className,children,...rest}:PropsWithChildren<Props>){
  const sizes={sm:'h-9 px-3 text-sm',md:'h-10 px-4 text-sm',lg:'h-12 px-5 text-base'}[size]
  const variants={
    primary:'bg-pink-500 text-white hover:bg-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500',
    ghost:'bg-transparent hover:bg-zinc-100 text-zinc-900',
    outline:'border border-zinc-300 hover:bg-zinc-50 text-zinc-900'
  }[variant]
  return <button className={cn('inline-flex items-center justify-center rounded-lg transition-colors',sizes,variants,className)} {...rest}>{children}</button>
}
