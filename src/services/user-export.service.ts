import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs-hardened';
import {
  GenerateUserExportDto,
  UserExportRowDto,
} from '../dto/GenerateUserExportDto';
import {
  ResolvedUserExportGroup,
  USER_EXPORT_COLUMN_HEADER_FILL,
  USER_EXPORT_OWNED_LIBRARY_FILL,
  USER_EXPORT_OWNED_MEASURE_FILL,
  USER_EXPORT_SHARED_MEASURE_FILL,
  USER_EXPORT_SHARED_LIBRARY_FILL,
  USER_EXPORT_SHEET_NAME,
  resolveUserExportLayout,
  UserExportColumn,
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

const GROUP_FILL_BY_KEY: Record<string, string> = {
  ownedMeasures: USER_EXPORT_OWNED_MEASURE_FILL,
  sharedMeasures: USER_EXPORT_SHARED_MEASURE_FILL,
  ownedLibraries: USER_EXPORT_OWNED_LIBRARY_FILL,
  sharedLibraries: USER_EXPORT_SHARED_LIBRARY_FILL,
};

@Injectable()
export class UserExportService {
  /**
   * Generates the "Full User Export" workbook.
   *
   * The output always contains the two header rows for the included column
   * groups. Any rows provided in the payload are written starting at row 3 (in
   * column order). When `rows` is empty the result is headers-only.
   */
  async generateUserExportXlsx(
    generateUserExportDto: GenerateUserExportDto,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(USER_EXPORT_SHEET_NAME);
    const { columns, groups } = resolveUserExportLayout(generateUserExportDto);

    this.writeGroupHeaderRow(worksheet, groups);
    this.writeColumnHeaderRow(worksheet, columns);
    this.writeDataRows(worksheet, generateUserExportDto?.rows ?? [], columns, groups);
    this.applySheetFeatures(worksheet, columns.length);
    this.applyColumnWidths(worksheet, columns);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /** Row 1: merged, colored group header cells (bold white, centered). */
  private writeGroupHeaderRow(
    worksheet: ExcelJS.Worksheet,
    groups: ResolvedUserExportGroup[],
  ): void {
    const groupRow = worksheet.getRow(1);
    groups.forEach((group) => {
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

  /** Row 2: the selected column headers (bold, blue fill, thin borders). */
  private writeColumnHeaderRow(
    worksheet: ExcelJS.Worksheet,
    columns: UserExportColumn[],
  ): void {
    const headerRow = worksheet.getRow(2);
    columns.forEach((column, index) => {
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
   * Writes each element of `rows` starting at row 3, in the selected column
   * field order. Works automatically when `rows` is empty (headers-only output).
   * When a row carries a `measureError`, that message is rendered in red in the
   * first visible measure-name column.
   */
  private writeDataRows(
    worksheet: ExcelJS.Worksheet,
    rows: GenerateUserExportDto['rows'],
    columns: UserExportColumn[],
    groups: ResolvedUserExportGroup[],
  ): void {
    rows.forEach((row, index) => {
      const values = columns.map((column) => row?.[column.field] ?? '');
      const addedRow = worksheet.addRow(values);

      if (row?.measureError) {
        this.writeMeasureError(addedRow, row.measureError, columns);
      }
      this.applyColorizedDataCellFills(addedRow, groups);
      if (this.isLastRowForUser(row, rows[index + 1])) {
        this.applyUserSeparatorBorder(addedRow, columns.length);
      }
    });
  }

  /**
   * Renders a measure-fetch error for a user in the first visible measure-name
   * column so an admin can see that the user's measure data could not be
   * retrieved upstream.
   */
  private writeMeasureError(
    row: ExcelJS.Row,
    message: string,
    columns: UserExportColumn[],
  ): void {
    const candidateFields: Array<keyof UserExportRowDto> = [
      'ownedMeasureName',
      'sharedMeasureName',
    ];
    const columnIndex =
      candidateFields
        .map((field) => columns.findIndex((column) => column.field === field) + 1)
        .find((index) => index > 0) ?? 0;
    if (columnIndex === 0) {
      return;
    }

    const cell = row.getCell(columnIndex);
    cell.value = message;
    cell.font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FFFF0000' },
    };
  }

  private applyColorizedDataCellFills(
    row: ExcelJS.Row,
    groups: ResolvedUserExportGroup[],
  ): void {
    groups
      .filter((group) => group.key !== 'userMetadata')
      .forEach((group) => {
        const fill = GROUP_FILL_BY_KEY[group.key];
        for (let columnIndex = group.start; columnIndex <= group.end; columnIndex++) {
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

  private applyUserSeparatorBorder(row: ExcelJS.Row, columnCount: number): void {
    for (let columnIndex = 1; columnIndex <= columnCount; columnIndex++) {
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

  /** Enables auto-filter across the selected columns on row 2 and freezes rows 1–2. */
  private applySheetFeatures(
    worksheet: ExcelJS.Worksheet,
    columnCount: number,
  ): void {
    worksheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: 2, column: columnCount },
    };
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2 }];
  }

  /** Reasonable, header-driven column widths. */
  private applyColumnWidths(
    worksheet: ExcelJS.Worksheet,
    columns: UserExportColumn[],
  ): void {
    columns.forEach((column, index) => {
      worksheet.getColumn(index + 1).width = Math.max(
        column.header.length + 4,
        14,
      );
    });
  }
}
