"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Type, Sun, Moon, Monitor, Eye } from "lucide-react"

export function AccessibilityToolbar() {
    const [fontSize, setFontSize] = useState(100)
    const [contrast, setContrast] = useState("normal") // normal, high
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Apply font size
        document.documentElement.style.fontSize = `${fontSize}%`

        // Apply contrast
        if (contrast === "high") {
            document.documentElement.classList.add("high-contrast")
        } else {
            document.documentElement.classList.remove("high-contrast")
        }
    }, [fontSize, contrast])

    const increaseFont = () => setFontSize(prev => Math.min(prev + 10, 150))
    const decreaseFont = () => setFontSize(prev => Math.max(prev - 10, 80))
    const resetFont = () => setFontSize(100)

    const toggleContrast = () => {
        setContrast(prev => prev === "normal" ? "high" : "normal")
    }

    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end">
            <Button
                variant="outline"
                size="icon"
                className="rounded-l-lg rounded-r-none bg-blue-600 text-white hover:bg-blue-700 border-blue-700 shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Accessibility Tools"
            >
                <Eye className="h-5 w-5" />
            </Button>

            {isOpen && (
                <div className="bg-white border border-gray-200 shadow-xl rounded-l-lg p-4 mt-2 space-y-4 w-64 animate-in slide-in-from-right">
                    <div>
                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Type className="h-4 w-4" /> Text Size
                        </h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={decreaseFont} className="flex-1">A-</Button>
                            <Button variant="outline" size="sm" onClick={resetFont} className="flex-1">A</Button>
                            <Button variant="outline" size="sm" onClick={increaseFont} className="flex-1">A+</Button>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Monitor className="h-4 w-4" /> Contrast
                        </h3>
                        <Button
                            variant={contrast === "high" ? "default" : "outline"}
                            className="w-full justify-start gap-2"
                            onClick={toggleContrast}
                        >
                            {contrast === "high" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            {contrast === "high" ? "Normal Contrast" : "High Contrast"}
                        </Button>
                    </div>

                    <div className="border-t pt-4 text-xs text-gray-500">
                        <p>Screen Reader Access: Enabled</p>
                    </div>
                </div>
            )}
        </div>
    )
}
