import * as ExcelJS from 'exceljs';

export const defaultKeySheetFontStyle = {
  color: { argb: '000000' },
  name: 'Arial',
  size: 14,
  bold: true,
} as ExcelJS.Font;

export const defaultKeySheetAlignmentStyle = {
  wrapText: true,
  vertical: 'middle',
} as ExcelJS.Alignment;

export const defaultKeySheetBorderStyle = {
  style: 'thin',
  color: { argb: 'D4D4D4' },
} as ExcelJS.Border;
