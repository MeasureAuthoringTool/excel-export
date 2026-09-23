import { CodeSystemExportService } from './code-system-export.service';
import * as ExcelJS from 'exceljs-hardened';
import { GenerateCodeSystemExportDto } from '../dto/GenerateCodeSystemExportDto';
import {
  CODE_SYSTEM_EXPORT_COLUMN_HEADER_FILL,
  CODE_SYSTEM_EXPORT_COLUMNS,
  CODE_SYSTEM_EXPORT_GROUPS,
  CODE_SYSTEM_EXPORT_SHEET_NAME,
} from './static/CodeSystemExportColumns';

// Node Buffer uses ArrayBuffer internally; copy it into a clean ArrayBuffer for ExcelJS's load()
function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(
    new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength),
  );
  return ab;
}

describe('CodeSystemExportService', () => {
  let service: CodeSystemExportService;

  beforeEach(() => {
    service = new CodeSystemExportService();
  });

  it('generates a headers-only workbook when rows is empty', async () => {
    const buffer = await service.generateCodeSystemExportXlsx({ rows: [] });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));

    // Sheet exists with the expected name
    const worksheet = workbook.getWorksheet(CODE_SYSTEM_EXPORT_SHEET_NAME);
    expect(worksheet).toBeDefined();

    // Row 1: merged group cells with correct labels and spans
    const groupRow = worksheet.getRow(1);
    CODE_SYSTEM_EXPORT_GROUPS.forEach((group) => {
      expect(groupRow.getCell(group.start).value).toBe(group.label);
      for (let col = group.start; col <= group.end; col++) {
        expect(worksheet.getCell(1, col).isMerged).toBe(true);
      }
      const fill = groupRow.getCell(group.start).fill as ExcelJS.FillPattern;
      expect(fill.fgColor?.argb).toBe(group.fill);
    });

    // Groups collectively span all columns contiguously
    expect(CODE_SYSTEM_EXPORT_GROUPS[0].start).toBe(1);
    expect(
      CODE_SYSTEM_EXPORT_GROUPS[CODE_SYSTEM_EXPORT_GROUPS.length - 1].end,
    ).toBe(CODE_SYSTEM_EXPORT_COLUMNS.length);
    for (let i = 1; i < CODE_SYSTEM_EXPORT_GROUPS.length; i++) {
      expect(CODE_SYSTEM_EXPORT_GROUPS[i].start).toBe(
        CODE_SYSTEM_EXPORT_GROUPS[i - 1].end + 1,
      );
    }

    // Row 2: all headers in order with the blue column-header fill
    const headerRow = worksheet.getRow(2);
    expect(CODE_SYSTEM_EXPORT_COLUMNS).toHaveLength(11);
    CODE_SYSTEM_EXPORT_COLUMNS.forEach((column, index) => {
      const cell = headerRow.getCell(index + 1);
      expect(cell.value).toBe(column.header);
      const fill = cell.fill as ExcelJS.FillPattern;
      expect(fill.fgColor?.argb).toBe(CODE_SYSTEM_EXPORT_COLUMN_HEADER_FILL);
    });

    // A dedicated VSAC Version column is present (needed for the future report)
    expect(
      CODE_SYSTEM_EXPORT_COLUMNS.some((c) => c.field === 'vsacVersion'),
    ).toBe(true);

    // Auto-filter is set across all 11 columns on row 2 (A2:K2)
    expect(worksheet.autoFilter).toBe('A2:K2');

    // Top two rows are frozen
    expect(worksheet.views?.[0]).toMatchObject({ state: 'frozen', ySplit: 2 });

    // No data rows: only the two header rows exist
    expect(worksheet.actualRowCount).toBe(2);
  });

  it('writes data rows starting at row 3 in column field order', async () => {
    const buffer = await service.generateCodeSystemExportXlsx({
      rows: [
        {
          title: 'LOINC',
          name: 'LOINC',
          oid: 'urn:oid:2.16.840.1.113883.6.1',
          fullUrl: 'https://loinc.org',
          fhirVersion: '2.40',
          vsacVersion: '2.74',
          versionId: '1',
          latestVersion: 'Yes',
          lastUpdated: '2026-01-15 10:30:00',
          lastUpdatedUpstream: '2026-02-20 08:15:00',
          id: 'LOINCversion2.40',
        },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(CODE_SYSTEM_EXPORT_SHEET_NAME);

    expect(worksheet.actualRowCount).toBe(3);
    const dataRow = worksheet.getRow(3);
    expect(dataRow.getCell(1).value).toBe('LOINC'); // title
    expect(dataRow.getCell(3).value).toBe('urn:oid:2.16.840.1.113883.6.1'); // oid
    expect(dataRow.getCell(6).value).toBe('2.74'); // VSAC Version
    expect(dataRow.getCell(8).value).toBe('Yes'); // Is Latest Version
    // Column 11 (ID) is the last field
    expect(dataRow.getCell(11).value).toBe('LOINCversion2.40');
  });

  it('produces headers-only output when the payload has no rows property', async () => {
    const buffer = await service.generateCodeSystemExportXlsx(
      {} as GenerateCodeSystemExportDto,
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(CODE_SYSTEM_EXPORT_SHEET_NAME);

    expect(worksheet.actualRowCount).toBe(2);
  });

  it('writes multiple rows and defaults missing fields to empty string', async () => {
    const buffer = await service.generateCodeSystemExportXlsx({
      rows: [
        { title: 'AlphaSystem', oid: 'urn:oid:1.2.3' },
        { title: 'BetaSystem', latestVersion: 'No' },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(CODE_SYSTEM_EXPORT_SHEET_NAME);

    // Two header rows + two data rows
    expect(worksheet.actualRowCount).toBe(4);

    const row3 = worksheet.getRow(3);
    expect(row3.getCell(1).value).toBe('AlphaSystem'); // title (col 1)
    expect(row3.getCell(3).value).toBe('urn:oid:1.2.3'); // oid (col 3)
    // A field not supplied defaults to '' (name = col 2)
    expect(row3.getCell(2).value).toBe('');

    const row4 = worksheet.getRow(4);
    expect(row4.getCell(1).value).toBe('BetaSystem');
    expect(row4.getCell(8).value).toBe('No'); // Is Latest Version (col 8)
  });

  it('applies group-header styling, blue column headers, freeze and widths', async () => {
    const buffer = await service.generateCodeSystemExportXlsx({ rows: [] });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(toArrayBuffer(buffer));
    const worksheet = workbook.getWorksheet(CODE_SYSTEM_EXPORT_SHEET_NAME);

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
    expect(headerFill.fgColor?.argb).toBe(CODE_SYSTEM_EXPORT_COLUMN_HEADER_FILL);
    expect(headerCell.border?.bottom?.style).toBe('thin');

    // Freeze: xSplit 0, ySplit 2
    expect(worksheet.views?.[0]).toMatchObject({
      state: 'frozen',
      xSplit: 0,
      ySplit: 2,
    });

    // Column widths are header-driven and at least 14
    CODE_SYSTEM_EXPORT_COLUMNS.forEach((_column, index) => {
      const width = worksheet.getColumn(index + 1).width ?? 0;
      expect(width).toBeGreaterThanOrEqual(14);
    });
  });
});

