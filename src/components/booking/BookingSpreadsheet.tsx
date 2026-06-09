import { useState, useRef, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BookingCategory, BookingRecord } from "@/lib/api";

interface ColumnDef {
  key: string;
  label: string;
  labelEn: string;
  type?: "date" | "time" | "number" | "text";
}

const COLUMNS: Record<BookingCategory, ColumnDef[]> = {
  taxi_transfer: [
    { key: "date", label: "Ημερομηνία", labelEn: "Date", type: "date" },
    { key: "first_name", label: "Όνομα", labelEn: "First Name" },
    { key: "last_name", label: "Επώνυμο", labelEn: "Last Name" },
    { key: "time", label: "Ώρα", labelEn: "Time", type: "time" },
    { key: "pickup_location", label: "Τοποθεσία Παραλαβής", labelEn: "Pickup Location" },
    { key: "destination", label: "Προορισμός", labelEn: "Destination" },
    { key: "final_price", label: "Τελική Τιμή", labelEn: "Final Price", type: "number" },
    { key: "partner_name", label: "Συνεργάτης", labelEn: "Partner" },
  ],
  rent_a_car: [
    { key: "date", label: "Ημερομηνία", labelEn: "Date", type: "date" },
    { key: "first_name", label: "Όνομα", labelEn: "First Name" },
    { key: "last_name", label: "Επώνυμο", labelEn: "Last Name" },
    { key: "time", label: "Ώρα", labelEn: "Time", type: "time" },
    { key: "pickup_location", label: "Τοποθεσία Παραλαβής", labelEn: "Pickup Location" },
    { key: "final_price", label: "Τελική Τιμή", labelEn: "Final Price", type: "number" },
  ],
  activity: [
    { key: "date", label: "Ημερομηνία", labelEn: "Date", type: "date" },
    { key: "first_name", label: "Όνομα", labelEn: "First Name" },
    { key: "last_name", label: "Επώνυμο", labelEn: "Last Name" },
    { key: "time", label: "Ώρα", labelEn: "Time", type: "time" },
    { key: "final_price", label: "Τελική Τιμή", labelEn: "Final Price", type: "number" },
  ],
};

interface BookingSpreadsheetProps {
  category: BookingCategory;
  records: BookingRecord[];
  userId: string;
  onSave: (record: BookingRecord) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

type DraftRow = Record<string, string>;

const emptyDraft = (): DraftRow => ({});

const BookingSpreadsheet = ({
  category,
  records,
  userId,
  onSave,
  onDelete,
}: BookingSpreadsheetProps) => {
  const { lang } = useLanguage();
  const columns = COLUMNS[category];
  const [draft, setDraft] = useState<DraftRow>(emptyDraft());
  const [editingCells, setEditingCells] = useState<Record<string, string>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const draftHasData = Object.values(draft).some((v) => v && v.trim() !== "");

  const handleCellBlur = useCallback(
    async (recordId: string, key: string, value: string, original: any) => {
      const cellKey = `${recordId}:${key}`;
      const originalValue = original?.[key] ?? "";
      if (String(value) === String(originalValue ?? "")) {
        setEditingCells((prev) => {
          const next = { ...prev };
          delete next[cellKey];
          return next;
        });
        return;
      }

      setSavingIds((prev) => new Set(prev).add(recordId));
      try {
        const record: any = { id: recordId, user_id: userId, category };
        record[key] = key === "final_price" ? (value ? Number(value) : null) : value || null;
        await onSave(record);
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(recordId);
          return next;
        });
        setEditingCells((prev) => {
          const next = { ...prev };
          delete next[cellKey];
          return next;
        });
      }
    },
    [category, userId, onSave]
  );

  const handleDraftBlur = useCallback(async () => {
    if (!draftHasData) return;

    const record: any = { user_id: userId, category };
    for (const col of columns) {
      const val = draft[col.key];
      if (val && val.trim()) {
        record[col.key] = col.type === "number" ? Number(val) : val;
      }
    }

    try {
      await onSave(record);
      setDraft(emptyDraft());
    } catch {
      // keep draft on error
    }
  }, [draft, draftHasData, category, userId, columns, onSave]);

  const handleDraftKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab" && !e.shiftKey) {
        const target = e.target as HTMLInputElement;
        const colIndex = columns.findIndex((c) => c.key === target.dataset.colkey);
        if (colIndex === columns.length - 1 && draftHasData) {
          e.preventDefault();
          handleDraftBlur();
        }
      }
    },
    [columns, draftHasData, handleDraftBlur]
  );

  const getCellValue = (record: any, key: string) => {
    const cellKey = `${record.id}:${key}`;
    if (cellKey in editingCells) return editingCells[cellKey];
    return record[key] ?? "";
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">#</TableHead>
            {columns.map((col) => (
              <TableHead key={col.key} className="min-w-[120px] whitespace-nowrap">
                {lang === "el" ? col.label : col.labelEn}
              </TableHead>
            ))}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record: any, idx) => (
            <TableRow
              key={record.id}
              onMouseEnter={() => setHoveredRow(record.id)}
              onMouseLeave={() => setHoveredRow(null)}
              className={savingIds.has(record.id) ? "opacity-60" : ""}
            >
              <TableCell className="text-center text-muted-foreground text-xs">
                {idx + 1}
              </TableCell>
              {columns.map((col) => (
                <TableCell key={col.key} className="p-0">
                  <input
                    type={col.type === "number" ? "number" : col.type === "date" ? "date" : col.type === "time" ? "time" : "text"}
                    className="w-full px-3 py-2 bg-transparent border-0 outline-none focus:ring-1 focus:ring-primary/30 rounded text-sm"
                    value={getCellValue(record, col.key)}
                    step={col.type === "number" ? "0.01" : undefined}
                    onChange={(e) => {
                      const cellKey = `${record.id}:${col.key}`;
                      setEditingCells((prev) => ({ ...prev, [cellKey]: e.target.value }));
                    }}
                    onBlur={(e) => handleCellBlur(record.id, col.key, e.target.value, record)}
                  />
                </TableCell>
              ))}
              <TableCell className="p-0">
                {hoveredRow === record.id && (
                  <button
                    onClick={() => onDelete(record.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    title={lang === "el" ? "Διαγραφή" : "Delete"}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}

          {/* Draft row */}
          <TableRow className="bg-muted/30">
            <TableCell className="text-center text-muted-foreground text-xs">
              {records.length + 1}
            </TableCell>
            {columns.map((col) => (
              <TableCell key={col.key} className="p-0">
                <input
                  type={col.type === "number" ? "number" : col.type === "date" ? "date" : col.type === "time" ? "time" : "text"}
                  className="w-full px-3 py-2 bg-transparent border-0 outline-none focus:ring-1 focus:ring-primary/30 rounded text-sm placeholder:text-muted-foreground/50"
                  placeholder={lang === "el" ? col.label : col.labelEn}
                  value={draft[col.key] || ""}
                  step={col.type === "number" ? "0.01" : undefined}
                  data-colkey={col.key}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, [col.key]: e.target.value }))
                  }
                  onBlur={handleDraftBlur}
                  onKeyDown={handleDraftKeyDown}
                />
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingSpreadsheet;
