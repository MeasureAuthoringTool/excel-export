import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs-hardened';
import { GenerateUserExportDto } from '../dto/GenerateUserExportDto';
import {
  USER_EXPORT_COLUMN_HEADER_FILL,
  USER_EXPORT_COLUMNS,
  USER_EXPORT_GROUPS,
  USER_EXPORT_SHEET_NAME,
} from './static/UserExportColumns';

@Injectable()
export class UserExportService {
  /**
   * Generates the "Full User Export" workbook.
   *
   * The output always contains the two header rows spanning 33 columns. Any
   * rows provided in the payload are written starting at row 3 (in column
   * order). When `rows` is empty the result is headers-only.
   */
  async generateUserExportXlsx(
    generateUserExportDto: GenerateUserExportDto,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(USER_EXPORT_SHEET_NAME);

    this.writeGroupHeaderRow(worksheet);
    this.writeColumnHeaderRow(worksheet);
    this.writeDataRows(worksheet, generateUserExportDto?.rows ?? []);
    this.applySheetFeatures(worksheet);
    this.applyColumnWidths(worksheet);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /** Row 1: five merged, colored group header cells (bold white, centered). */
  private writeGroupHeaderRow(worksheet: ExcelJS.Worksheet): void {
    const groupRow = worksheet.getRow(1);
    USER_EXPORT_GROUPS.forEach((group) => {
      worksheet.mergeCells(1, group.start, 1, group.end);
      const cell = groupRow.getCell(group.start);
      cell.value = group.label;
      cell.font = {
        name: 'Arial',
        size: 12,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: group.fill },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    groupRow.commit();
  }

  /** Row 2: the 33 column headers (bold, blue fill, thin borders). */
  private writeColumnHeaderRow(worksheet: ExcelJS.Worksheet): void {
    const headerRow = worksheet.getRow(2);
    USER_EXPORT_COLUMNS.forEach((column, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = column.header;
      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FF000000' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: USER_EXPORT_COLUMN_HEADER_FILL },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });
    headerRow.commit();
  }

  /**
   * Writes each element of `rows` starting at row 3, in the column field order.
   * Works automatically when `rows` is empty (headers-only output).
   */
  private writeDataRows(
    worksheet: ExcelJS.Worksheet,
    rows: GenerateUserExportDto['rows'],
  ): void {
    rows.forEach((row) => {
      const values = USER_EXPORT_COLUMNS.map(
        (column) => row?.[column.field] ?? '',
      );
      worksheet.addRow(values);
    });
  }

  /** Enables auto-filter across all 33 columns on row 2 and freezes rows 1–2. */
  private applySheetFeatures(worksheet: ExcelJS.Worksheet): void {
    worksheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: 2, column: USER_EXPORT_COLUMNS.length },
    };
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];
  }

  /** Reasonable, header-driven column widths. */
  private applyColumnWidths(worksheet: ExcelJS.Worksheet): void {
    USER_EXPORT_COLUMNS.forEach((column, index) => {
      worksheet.getColumn(index + 1).width = Math.max(
        column.header.length + 4,
        14,
      );
    });
  }
}
