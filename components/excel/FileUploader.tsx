'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import type { ParsedSheet } from '../../types/excel';

type FileUploaderProps = {
  onSheetsParsed: (sheets: ParsedSheet[]) => void;
};

const acceptedTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  '.xlsx',
  '.xls'
];

const isAcceptedFile = (file: File) => {
  if (acceptedTypes.includes(file.type)) {
    return true;
  }
  return acceptedTypes.some((type) => file.name.toLowerCase().endsWith(type.replace('.', '')));
};

const createParsedSheets = (workbook: XLSX.WorkBook): ParsedSheet[] => {
  return workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null
    });

    const headerRow = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
      header: 1,
      blankrows: false,
      range: 0
    });
    const firstRow = Array.isArray(headerRow) ? headerRow[0] : [];
    const headers = Array.isArray(firstRow) && firstRow.length > 0
      ? firstRow.map((value, index) => {
          if (value === null || value === undefined || value === '') {
            return `Column ${index + 1}`;
          }
          return String(value);
        })
      : (rows[0] ? Object.keys(rows[0]) : []);

    return {
      name: sheetName,
      rows,
      headers
    };
  });
};

export function FileUploader({ onSheetsParsed }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      if (!isAcceptedFile(file)) {
        setError('Please upload a valid Excel file (.xlsx or .xls).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const binary = event.target?.result;
        if (!binary) {
          setError('Unable to read the selected file.');
          return;
        }

        try {
          const workbook = XLSX.read(binary, { type: 'array' });
          const parsedSheets = createParsedSheets(workbook);
          if (!parsedSheets.length) {
            setError('No worksheets were detected in the uploaded file.');
            return;
          }
          setError(null);
          onSheetsParsed(parsedSheets);
        } catch (parseError) {
          console.error(parseError);
          setError('Failed to parse the Excel file. Please verify the file is not corrupted.');
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [onSheetsParsed]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const buttonLabel = useMemo(() => {
    return isDragging ? 'Drop file here' : 'Click to upload';
  }, [isDragging]);

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'
        }`}
      >
        <div className="text-lg font-semibold text-slate-700">Upload survey results</div>
        <p className="max-w-sm text-sm text-slate-500">
          Drag and drop an Excel workbook (.xlsx) or click below to select a file. All processing happens in your browser.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {buttonLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
        />
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Supported formats: .xlsx (recommended) and .xls. Only the first worksheet is selected by default after upload.
        </p>
      )}
    </div>
  );
}
