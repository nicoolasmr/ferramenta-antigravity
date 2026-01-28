"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Since we are not installing radix-ui just for this, I'll implement a simpler version
// or assumes I can install it. The prompt said "Next.js App Router + TS + Tailwind + Framer Motion + date-fns + lucide-react".
// I should stick to these. I will build a custom Tabs component using Framer Motion/React State.

import { motion } from "framer-motion"

interface TabsProps {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
    className?: string
}

const TabsContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
} | null>(null)

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div
            className={cn(
                "inline-flex h-11 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground",
                className
            )}
        >
            {children}
        </div>
    )
}

export function TabsTrigger({ value, className, children }: { value: string, className?: string, children: React.ReactNode }) {
    const context = React.useContext(TabsContext)
    const isActive = context?.value === value

    return (
        <button
            onClick={() => context?.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground",
                className
            )}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, className, children }: { value: string, className?: string, children: React.ReactNode }) {
    const context = React.useContext(TabsContext)
    if (context?.value !== value) return null

    return (
        <div
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in",
                className
            )}
        >
            {children}
        </div>
    )
}
