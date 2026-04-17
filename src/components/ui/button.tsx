import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6] disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90': variant === 'default',
            'border border-[#e2e8f0] bg-white shadow-sm hover:bg-[#f1f5f9] hover:text-[#1e293b]': variant === 'outline',
            'hover:bg-[#f1f5f9] hover:text-[#1e293b]': variant === 'ghost',
            'bg-[#ef4444] text-white shadow-sm hover:bg-[#ef4444]/90': variant === 'destructive',
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-md px-3 text-xs': size === 'sm',
            'h-10 rounded-md px-8': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
