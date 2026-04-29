"use client"

import { useState, useRef, useEffect } from "react"
import EmojiPicker from "emoji-picker-react"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface EmojiPickerDialogProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPickerDialog({ onEmojiSelect, disabled = false }: EmojiPickerDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="shrink-0"
          title="Agregar emoji"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-0" align="start">
        <EmojiPicker
          onEmojiClick={(emojiObject) => {
            onEmojiSelect(emojiObject.emoji)
            setOpen(false)
          }}
          width={300}
          height={400}
          searchDisabled={false}
          previewConfig={{
            showPreview: false,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
