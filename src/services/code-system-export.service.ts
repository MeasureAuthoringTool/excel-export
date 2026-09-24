import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs-hardened';
import { GenerateCodeSystemExportDto } from '../dto/GenerateCodeSystemExportDto';
import {
  CODE_SYSTEM_EXPORT_COLUMN_HEADER_FILL,
  CODE_SYSTEM_EXPORT_COLUMNS,
  CODE_SYSTEM_EXPORT_GROUPS,
  CODE_SYSTEM_EXPORT_SHEET_NAME,
} from './static/CodeSystemExportColumns';

@Injectable()
export class CodeSystemExportService {
  /**
   * Generates the "Code System Export" workbook.
   *
   * The output always contains the two header rows spanning every column. Any
   * rows provided in the payload are written starting at row 3 (in column
   * order). When `rows` is empty the result is headers-only.
   */
  async generateCodeSystemExportXlsx(
    generateCodeSystemExportDto: GenerateCodeSystemExportDto,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(CODE_SYSTEM_EXPORT_SHEET_NAME);

    this.writeGroupHeaderRow(worksheet);
    this.writeColumnHeaderRow(worksheet);
    this.writeDataRows(worksheet, generateCodeSystemExportDto?.rows ?? []);
    this.applySheetFeatures(worksheet);
    this.applyColumnWidths(worksheet);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /** Row 1: merged, colored group header cells (bold white, centered). */
  private writeGroupHeaderRow(worksheet: ExcelJS.Worksheet): void {
    const groupRow = worksheet.getRow(1);
    CODE_SYSTEM_EXPORT_GROUPS.forEach((group) => {
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

  /** Row 2: the column headers (bold, blue fill, thin borders). */
  private writeColumnHeaderRow(worksheet: ExcelJS.Worksheet): void {
    const headerRow = worksheet.getRow(2);
    CODE_SYSTEM_EXPORT_COLUMNS.forEach((column, index) => {
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
        fgColor: { argb: CODE_SYSTEM_EXPORT_COLUMN_HEADER_FILL },
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
    rows: GenerateCodeSystemExportDto['rows'],
  ): void {
    rows.forEach((row) => {
      const values = CODE_SYSTEM_EXPORT_COLUMNS.map(
        (column) => row?.[column.field] ?? '',
      );
      worksheet.addRow(values);
    });
  }

  /** Enables auto-filter across all columns on row 2 and freezes rows 1–2. */
  private applySheetFeatures(worksheet: ExcelJS.Worksheet): void {
    worksheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: 2, column: CODE_SYSTEM_EXPORT_COLUMNS.length },
    };
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];
  }

  /** Reasonable, header-driven column widths. */
  private applyColumnWidths(worksheet: ExcelJS.Worksheet): void {
    CODE_SYSTEM_EXPORT_COLUMNS.forEach((column, index) => {
      worksheet.getColumn(index + 1).width = Math.max(
        column.header.length + 4,
        14,
      );
    });
  }
}
