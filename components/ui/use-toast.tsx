"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "loading"

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toast: (message: string, type?: ToastType, duration?: number) => void
    dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const toast = React.useCallback((message: string, type: ToastType = "success", duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, message, type, duration }])

        if (duration > 0) {
            setTimeout(() => {
                dismiss(id)
            }, duration)
        }
    }, [dismiss])

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-in min-w-[300px]",
                            t.type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 backdrop-blur-md",
                            t.type === "error" && "bg-rose-500/10 border-rose-500/20 text-rose-500 backdrop-blur-md",
                            t.type === "loading" && "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 backdrop-blur-md"
                        )}
                    >
                        {t.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                        {t.type === "error" && <AlertCircle className="w-5 h-5" />}
                        {t.type === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}

                        <p className="text-sm font-medium flex-1">{t.message}</p>

                        <button onClick={() => dismiss(t.id)} className="p-1 hover:bg-white/10 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
