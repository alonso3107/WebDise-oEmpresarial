// ============================================================
// BoticaVR — DatePickerFiltro
// Filtro de fecha compacto basado en Chakra DatePicker.
// ============================================================

import { DatePicker, Portal, parseDate } from "@chakra-ui/react";
import { Calendar } from "lucide-react";

export default function DatePickerFiltro({
  label,
  value,
  onChange,
  width = "9.25rem",
  placeholder = "Fecha",
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="text-xs text-[var(--color-texto-sec)] whitespace-nowrap leading-none">
        {label}
      </span>
      <DatePicker.Root
        value={value ? [parseDate(value)] : []}
        onValueChange={({ value: nextValue }) => {
          onChange(nextValue[0]?.toString() ?? "");
        }}
        locale="es-PE"
        startOfWeek={1}
        positioning={{ placement: "bottom-start" }}
        size="sm"
        variant="outline"
        width={width}
        placeholder={placeholder}
        openOnClick
        closeOnSelect
      >
        <DatePicker.Control>
          <DatePicker.Input className="text-sm" />
          <DatePicker.IndicatorGroup>
            <DatePicker.Trigger>
              <Calendar className="w-4 h-4" />
            </DatePicker.Trigger>
          </DatePicker.IndicatorGroup>
        </DatePicker.Control>
        <Portal>
          <DatePicker.Positioner>
            <DatePicker.Content
              css={{
                borderRadius: "16px",
                border: "1px solid var(--chakra-colors-gray-200)",
                background: "var(--chakra-colors-white)",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                overflow: "hidden",
                _focusWithin: {
                  borderColor: "var(--chakra-colors-gray-300)",
                },
              }}
            >
              <DatePicker.View view="day">
                <DatePicker.Header />
                <DatePicker.DayTable />
              </DatePicker.View>
              <DatePicker.View view="month">
                <DatePicker.Header />
                <DatePicker.MonthTable />
              </DatePicker.View>
              <DatePicker.View view="year">
                <DatePicker.Header />
                <DatePicker.YearTable />
              </DatePicker.View>
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker.Root>
    </div>
  );
}
