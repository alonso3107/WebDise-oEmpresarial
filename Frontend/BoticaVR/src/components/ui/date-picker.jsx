import * as React from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DatePicker({ value, onChange, placeholder = "Seleccionar fecha", disabled = false, className }) {
  // Convertir el valor string (YYYY-MM-DD) a objeto Date para el calendario
  const date = React.useMemo(() => {
    if (!value) return undefined
    try {
      // parseISO maneja de forma segura las fechas en formato string YYYY-MM-DD
      return parseISO(value)
    } catch (e) {
      return undefined
    }
  }, [value])

  const handleSelect = (selectedDate) => {
    if (!selectedDate) {
      onChange("")
      return
    }
    // Formatear a string YYYY-MM-DD antes de enviar al callback
    const formatted = format(selectedDate, "yyyy-MM-dd")
    onChange(formatted)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full sm:w-[180px] justify-start text-left font-normal bg-[var(--color-card)] border-[var(--color-borde)] text-[var(--color-texto)] hover:bg-[var(--color-fondo)] rounded-xl h-10 px-3",
            !value && "text-[var(--color-texto-sec)]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[var(--color-texto-sec)] shrink-0" />
          {value && date ? (
            format(date, "PPP", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-[var(--color-card)] border-[var(--color-borde)]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={disabled}
          locale={es}
          initialFocus
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2035, 11)}
        />
      </PopoverContent>
    </Popover>
  )
}
