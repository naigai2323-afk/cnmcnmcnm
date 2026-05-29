import ExcelJS from "exceljs";
import { ModuleConfig } from "@/lib/modules";
import { formatDate } from "@/lib/utils";

export async function workbookFromRows(config: ModuleConfig, rows: Record<string, unknown>[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(config.title);
  sheet.columns = config.fields.map((field) => ({
    header: field.label,
    key: field.key,
    width: Math.max(14, field.label.length * 2)
  }));
  for (const row of rows) {
    const out: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = row[field.key];
      out[field.key] = field.type === "date" || field.type === "datetime" ? formatDate(value) : value;
    }
    sheet.addRow(out);
  }
  sheet.getRow(1).font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

export async function templateWorkbook(config: ModuleConfig) {
  return workbookFromRows(config, []);
}

export async function parseWorkbook(buffer: ArrayBuffer, config: ModuleConfig) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const headers: Record<number, string> = {};
  sheet.getRow(1).eachCell((cell, col) => {
    const label = String(cell.value ?? "").trim();
    const field = config.fields.find((item) => item.label === label || item.key === label);
    if (field) headers[col] = field.key;
  });
  const rows: Record<string, unknown>[] = [];
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const item: Record<string, unknown> = {};
    row.eachCell((cell, col) => {
      const key = headers[col];
      if (!key) return;
      item[key] = cell.value instanceof Date ? cell.value.toISOString().slice(0, 10) : cell.text || cell.value;
    });
    if (Object.keys(item).length) rows.push(item);
  });
  return rows;
}

export function validateRows(config: ModuleConfig, rows: Record<string, unknown>[]) {
  return rows.map((row, index) => {
    const errors: string[] = [];
    for (const field of config.fields) {
      if (field.required && (row[field.key] === undefined || row[field.key] === "")) {
        errors.push(`${field.label}不能为空`);
      }
    }
    return { index: index + 2, row, errors };
  });
}
