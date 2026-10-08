import { UserExportService } from './user-export.service';
import * as ExcelJS from 'exceljs-hardened';
import { GenerateUserExportDto } from '../dto/GenerateUserExportDto';
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

// Node Buffer uses ArrayBuffer internally; copy it into a clean ArrayBuffer for ExcelJS's load()
function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(
    new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength),
  );
  return ab;
}

describe('UserExportService', () => {
  let service: UserExportService;

  beforeEach(() => {
    service = new UserExportService();
  });

  it('generates a headers-only workbook when rows is empty', async () => {
    const buffer = await service.generateUserExportXlsx({ rows: [] });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));

    // Sheet exists with the expected name
    const worksheet = workbook.getWorksheet(USER_EXPORT_SHEET_NAME);
    expect(worksheet).toBeDefined();

    // Row 1: five merged group cells with correct labels and spans
    const groupRow = worksheet.getRow(1);
    expect(USER_EXPORT_GROUPS).toHaveLength(5);
    USER_EXPORT_GROUPS.forEach((group) => {
      expect(groupRow.getCell(group.start).value).toBe(group.label);
      // Every column in the group's span is part of the same merged region
      for (let col = group.start; col <= group.end; col++) {
        expect(worksheet.getCell(1, col).isMerged).toBe(true);
      }
      // Row 1 keeps its per-group fill color
      const fill = groupRow.getCell(group.start).fill as ExcelJS.FillPattern;
      expect(fill.fgColor?.argb).toBe(group.fill);
    });
    // Groups collectively span all 33 columns contiguously
    expect(USER_EXPORT_GROUPS[0].start).toBe(1);
    expect(USER_EXPORT_GROUPS[USER_EXPORT_GROUPS.length - 1].end).toBe(33);
    for (let i = 1; i < USER_EXPORT_GROUPS.length; i++) {
      expect(USER_EXPORT_GROUPS[i].start).toBe(
        USER_EXPORT_GROUPS[i - 1].end + 1,
      );
    }

    // Row 2: all 33 headers in order
    const headerRow = worksheet.getRow(2);
    expect(USER_EXPORT_COLUMNS).toHaveLength(33);
    USER_EXPORT_COLUMNS.forEach((column, index) => {
      const cell = headerRow.getCell(index + 1);
      expect(cell.value).toBe(column.header);
      // Row 2 uses the blue column-header fill (#0073C8)
      const fill = cell.fill as ExcelJS.FillPattern;
      expect(fill.fgColor?.argb).toBe(USER_EXPORT_COLUMN_HEADER_FILL);
    });

    // Auto-filter is set across all 33 columns on row 2 (A2:AG2)
    expect(worksheet.autoFilter).toBe('A2:AG2');

    // Top two rows are frozen
    expect(worksheet.views?.[0]).toMatchObject({ state: 'frozen', ySplit: 2 });

    // No data rows: only the two header rows exist
    expect(worksheet.actualRowCount).toBe(2);
  });

  it('writes data rows starting at row 3 in column field order', async () => {
    const buffer = await service.generateUserExportXlsx({
      rows: [
        {
          userDisplayName: 'Jane Doe',
          firstName: 'Jane',
          lastName: 'Doe',
          sharedLibraryUpdated: '2026-01-01',
        },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(USER_EXPORT_SHEET_NAME);

    expect(worksheet.actualRowCount).toBe(3);
    const dataRow = worksheet.getRow(3);
    expect(dataRow.getCell(1).value).toBe('Jane Doe');
    expect(dataRow.getCell(2).value).toBe('Jane');
    expect(dataRow.getCell(3).value).toBe('Doe');
    // Column 33 (Shared Library Updated) is the last field
    expect(dataRow.getCell(33).value).toBe('2026-01-01');
  });

  it('produces headers-only output when the payload has no rows property', async () => {
    const buffer = await service.generateUserExportXlsx(
      {} as GenerateUserExportDto,
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(USER_EXPORT_SHEET_NAME);

    // The `rows ?? []` branch keeps only the two header rows
    expect(worksheet.actualRowCount).toBe(2);
  });

  it('writes multiple rows and defaults missing fields to empty string', async () => {
    const buffer = await service.generateUserExportXlsx({
      rows: [
        { userDisplayName: 'User One', harpId: 'H1' },
        { userDisplayName: 'User Two', lastLogin: '2026-02-02' },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(USER_EXPORT_SHEET_NAME);

    // Two header rows + two data rows
    expect(worksheet.actualRowCount).toBe(4);

    const row3 = worksheet.getRow(3);
    expect(row3.getCell(1).value).toBe('User One'); // userDisplayName (col 1)
    expect(row3.getCell(4).value).toBe('H1'); // harpId (col 4)
    // A field not supplied defaults to '' (firstName = col 2)
    expect(row3.getCell(2).value).toBe('');

    const row4 = worksheet.getRow(4);
    expect(row4.getCell(1).value).toBe('User Two');
    expect(row4.getCell(9).value).toBe('2026-02-02'); // lastLogin (col 9)
  });

  it('applies fills and a medium separator after each user group', async () => {
    const buffer = await service.generateUserExportXlsx({
      rows: [
        {
          userDisplayName: 'User One',
          firstName: 'User',
          lastName: 'One',
          harpId: 'H1',
          ownedMeasureName: 'Owned Measure A',
          ownedMeasureVersion: '1.0',
          ownedMeasureStatus: 'Draft',
          ownedMeasureModel: 'QDM',
          ownedMeasureCmsId: 'CMS-1',
          ownedMeasureUpdated: '2026-01-01',
          sharedMeasureName: 'Shared Measure A',
          sharedMeasureVersion: '1.1',
          sharedMeasureStatus: 'Active',
          sharedMeasureModel: 'QDM',
          sharedMeasureCmsId: 'CMS-2',
          sharedMeasureOwner: 'Owner A',
          sharedMeasureUpdated: '2026-01-02',
          ownedLibraryName: 'Owned Library A',
          ownedLibraryVersion: '2.0',
          ownedLibraryStatus: 'Published',
          ownedLibraryModel: 'QDM',
          ownedLibraryUpdated: '2026-01-03',
          sharedLibraryName: 'Shared Library A',
          sharedLibraryVersion: '4.0',
          sharedLibraryStatus: 'Active',
          sharedLibraryModel: 'QDM',
          sharedLibraryOwner: 'Owner B',
          sharedLibraryUpdated: '2026-01-06',
        },
        {
          userDisplayName: 'User One',
          firstName: 'User',
          lastName: 'One',
          harpId: 'H1',
          sharedMeasureName: 'Shared Measure B',
          sharedMeasureUpdated: '2026-01-04',
        },
        {
          userDisplayName: 'User Two',
          firstName: 'User',
          lastName: 'Two',
          harpId: 'H2',
          ownedMeasureName: 'Owned Measure C',
          ownedMeasureVersion: '3.0',
          ownedMeasureStatus: 'Published',
          ownedMeasureModel: 'QDM',
          ownedMeasureCmsId: 'CMS-3',
          ownedMeasureUpdated: '2026-01-05',
        },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(USER_EXPORT_SHEET_NAME);

    const firstUserRow = worksheet.getRow(3);
    expect(
      (firstUserRow.getCell(10).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_OWNED_MEASURE_FILL);
    expect(firstUserRow.getCell(10).border?.left?.style).toBe('thin');
    expect(firstUserRow.getCell(10).border?.top?.style).toBeUndefined();
    expect(
      (firstUserRow.getCell(16).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_SHARED_MEASURE_FILL);
    expect(firstUserRow.getCell(16).border?.right?.style).toBe('thin');
    expect(
      (firstUserRow.getCell(23).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_OWNED_LIBRARY_FILL);
    expect(firstUserRow.getCell(23).border?.bottom?.style).toBe('thin');
    expect(
      (firstUserRow.getCell(28).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_SHARED_LIBRARY_FILL);
    expect(firstUserRow.getCell(28).border?.left?.style).toBe('thin');
    expect(
      (firstUserRow.getCell(1).fill as ExcelJS.FillPattern | undefined)
        ?.fgColor,
    ).toBeUndefined();

    const secondUserRow = worksheet.getRow(4);
    expect(
      (secondUserRow.getCell(10).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_OWNED_MEASURE_FILL);
    expect(
      (secondUserRow.getCell(16).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_SHARED_MEASURE_FILL);
    expect(
      (secondUserRow.getCell(17).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_SHARED_MEASURE_FILL);
    expect(
      (secondUserRow.getCell(28).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_SHARED_LIBRARY_FILL);

    const firstUserSeparator = firstUserRow.getCell(1).border?.bottom;
    expect(firstUserSeparator?.style).toBeUndefined();

    const firstUserLastRow = worksheet.getRow(4);
    expect(firstUserLastRow.getCell(1).border?.bottom?.style).toBe('medium');
    expect(firstUserLastRow.getCell(28).border?.bottom?.style).toBe('medium');
    expect(firstUserLastRow.getCell(33).border?.bottom?.style).toBe('medium');

    const finalRow = worksheet.getRow(5);
    expect(
      (finalRow.getCell(10).fill as ExcelJS.FillPattern).fgColor?.argb,
    ).toBe(USER_EXPORT_OWNED_MEASURE_FILL);
    expect(finalRow.getCell(1).border?.bottom?.style).toBe('medium');
    expect(finalRow.getCell(28).border?.bottom?.style).toBe('medium');
  });

  it('applies group-header styling, blue column headers, freeze and widths', async () => {
    const buffer = await service.generateUserExportXlsx({ rows: [] });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(USER_EXPORT_SHEET_NAME);

    // Row 1: bold white, centered
    const groupCell = worksheet.getRow(1).getCell(1);
    expect(groupCell.font).toMatchObject({
      bold: true,
      color: { argb: 'FFFFFFFF' },
    });
    expect(groupCell.alignment).toMatchObject({
      horizontal: 'center',
      vertical: 'middle',
    });

    // Row 2: bold, blue fill, thin borders
    const headerCell = worksheet.getRow(2).getCell(1);
    expect(headerCell.font).toMatchObject({ bold: true });
    const headerFill = headerCell.fill as ExcelJS.FillPattern;
    expect(headerFill.fgColor?.argb).toBe(USER_EXPORT_COLUMN_HEADER_FILL);
    expect(headerCell.border?.bottom?.style).toBe('thin');

    // Freeze: xSplit 0, ySplit 2
    expect(worksheet.views?.[0]).toMatchObject({
      state: 'frozen',
      xSplit: 0,
      ySplit: 2,
    });

    // Column widths are header-driven and at least 14
    USER_EXPORT_COLUMNS.forEach((_column, index) => {
      const width = worksheet.getColumn(index + 1).width ?? 0;
      expect(width).toBeGreaterThanOrEqual(14);
    });
  });

  it('renders a measure error in bold red in the Owned Measure Name column', async () => {
    const buffer = await service.generateUserExportXlsx({
      rows: [
        {
          userDisplayName: 'Broken User',
          measureError: 'Unable to retrieve this user',
        },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(USER_EXPORT_SHEET_NAME);

    const ownedMeasureNameCol =
      USER_EXPORT_COLUMNS.findIndex((c) => c.field === 'ownedMeasureName') + 1;
    const errorCell = worksheet.getRow(3).getCell(ownedMeasureNameCol);

    expect(errorCell.value).toBe('Unable to retrieve this user');
    const font = errorCell.font as ExcelJS.Font;
    expect(font.color?.argb).toBe('FFFF0000');
    expect(font.bold).toBe(true);

    // User metadata is still written on the same row
    expect(worksheet.getRow(3).getCell(1).value).toBe('Broken User');
  });
});
