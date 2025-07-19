"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditableCellProps {
  value: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
}

export function EditableCell({ value, onSave, className, inputClassName }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue.trim() !== "") {
      onSave(editValue)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn("h-8 py-1", inputClassName)}
        />
        <div className="flex items-center">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
            <Check className="h-4 w-4 text-emerald-500" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
            <X className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("cursor-pointer py-1 px-1 rounded hover:bg-muted/50", className)}
      onClick={() => setIsEditing(true)}
    >
      {value}
    </div>
  )
}
