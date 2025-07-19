"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLang } from "@/lang/useLang"

const languages = [
  {
    value: "kr",
    label: "한국어", 
    flag: "🇰🇷"
  },
  {
    value: "en",
    label: "English",
    flag: "🇺🇸"
  },
  {
    value: "vi", 
    label: "Tiếng Việt",
    flag: "🇻🇳"
  },
]

export function LanguageSelector() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)

  const currentLanguage = languages.find(language => language.value === lang) || languages[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t("languageSelector.currentLanguage")}
          className="w-[6rem] justify-between h-8 border-slate-700 bg-slate-800/90 hover:bg-slate-700 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-400" />
            <span className="text-lg text-slate-300">
              {currentLanguage?.flag}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[10rem] p-0 bg-slate-800/95 backdrop-blur-sm border-slate-700">
        <Command>
          <CommandInput 
            placeholder={t("languageSelector.label")} 
            className="text-sm text-slate-300 placeholder:text-slate-400"
          />
          <CommandList>
            <CommandEmpty className="text-slate-400 text-sm py-2">
              {t("languageSelector.noLanguageFound")}
            </CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={() => {
                    setLang(language.value)
                    setOpen(false)
                  }}
                  className="text-sm whitespace-nowrap text-slate-300 hover:bg-slate-700/50 hover:text-cyan-200"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      lang === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2 whitespace-nowrap">{language.flag}</span>
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 