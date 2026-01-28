import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
    variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25",
        warning: "border-transparent bg-amber-500/15 text-amber-500 hover:bg-amber-500/25",
        danger: "border-transparent bg-rose-500/15 text-rose-500 hover:bg-rose-500/25",
    },
}

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof badgeVariants.variant
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                badgeVariants.variant[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
