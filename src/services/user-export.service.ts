import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs-hardened';
import {
  GenerateUserExportDto,
  UserExportRowDto,
} from '../dto/GenerateUserExportDto';
import {
  USER_EXPORT_COLUMN_HEADER_FILL,
  USER_EXPORT_COLUMNS,
  USER_EXPORT_OWNED_LIBRARY_FILL,
  USER_EXPORT_OWNED_MEASURE_FILL,
  USER_EXPORT_GROUPS,
  USER_EXPORT_SHARED_MEASURE_FILL,
  USER_EXPORT_SHARED_LIBRARY_FILL,
  USER_EXPORT_SHEET_NAME,
} from './static/UserExportColumns';

const USER_METADATA_FIELDS: Array<keyof UserExportRowDto> = [
  'userDisplayName',
  'firstName',
  'lastName',
  'harpId',
  'emailAddress',
  'userStatus',
  'roles',
  'approval',
  'lastLogin',
];

const COLORIZED_COLUMN_GROUPS: Array<{
  start: number;
  end: number;
  fill: string;
}> = [
  { start: 10, end: 15, fill: USER_EXPORT_OWNED_MEASURE_FILL },
  { start: 16, end: 22, fill: USER_EXPORT_SHARED_MEASURE_FILL },
  { start: 23, end: 27, fill: USER_EXPORT_OWNED_LIBRARY_FILL },
  { start: 28, end: 33, fill: USER_EXPORT_SHARED_LIBRARY_FILL },
];

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
   * Works automatically when `rows` is empty (headers-only output). When a row
   * carries a `measureError`, that message is rendered in red in the Owned
   * Measure Name column instead of measure data.
   */
  private writeDataRows(
    worksheet: ExcelJS.Worksheet,
    rows: GenerateUserExportDto['rows'],
  ): void {
    rows.forEach((row, index) => {
      const values = USER_EXPORT_COLUMNS.map(
        (column) => row?.[column.field] ?? '',
      );
      const addedRow = worksheet.addRow(values);

      if (row?.measureError) {
        this.writeMeasureError(addedRow, row.measureError);
      }
      this.applyColorizedDataCellFills(addedRow);
      if (this.isLastRowForUser(row, rows[index + 1])) {
        this.applyUserSeparatorBorder(addedRow);
      }
    });
  }

  /**
   * Renders a measure-fetch error for a user: the message is written into the
   * Owned Measure Name column in bold red so an admin can see that the user's
   * measure data could not be retrieved upstream.
   */
  private writeMeasureError(row: ExcelJS.Row, message: string): void {
    const columnIndex =
      USER_EXPORT_COLUMNS.findIndex((c) => c.field === 'ownedMeasureName') + 1;
    const cell = row.getCell(columnIndex);
    cell.value = message;
    cell.font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FFFF0000' },
    };
  }

  private applyColorizedDataCellFills(row: ExcelJS.Row): void {
    COLORIZED_COLUMN_GROUPS.forEach(({ start, end, fill }) => {
      for (let columnIndex = start; columnIndex <= end; columnIndex++) {
        const cell = row.getCell(columnIndex);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fill },
        };
        cell.border = {
          left: { style: 'thin', color: { argb: 'FFB7B7B7' } },
          bottom: { style: 'thin', color: { argb: 'FFB7B7B7' } },
          right: { style: 'thin', color: { argb: 'FFB7B7B7' } },
        };
      }
    });
  }

  private applyUserSeparatorBorder(row: ExcelJS.Row): void {
    for (
      let columnIndex = 1;
      columnIndex <= USER_EXPORT_COLUMNS.length;
      columnIndex++
    ) {
      const cell = row.getCell(columnIndex);
      cell.border = {
        ...(cell.border ?? {}),
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
      };
    }
  }

  private isLastRowForUser(
    currentRow: UserExportRowDto,
    nextRow?: UserExportRowDto,
  ): boolean {
    if (!nextRow) {
      return true;
    }

    return (
      this.getUserIdentityKey(currentRow) !== this.getUserIdentityKey(nextRow)
    );
  }

  private getUserIdentityKey(row: UserExportRowDto): string {
    return USER_METADATA_FIELDS.map((field) => String(row?.[field] ?? '')).join(
      '||',
    );
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
