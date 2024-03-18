import { AppService } from './app.service';
import * as ExcelJS from 'exceljs';
import { keySheetDescription } from './static/KeySheetData';
describe('ExcelService', () => {
  let excelService: AppService;
  beforeEach(() => {
    excelService = new AppService();
  });
  it('should generate key worksheet correctly', () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('KEY');
    excelService.generateKeyWorksheet(worksheet);

    // Test column widths
    expect(worksheet.getColumn('A').width).toBe(76.38);
    expect(worksheet.getColumn('B').width).toBe(76.38);
    expect(worksheet.getColumn('C').width).toBe(76.38);

    // Test heading
    const headingCell = worksheet.getCell('A1');
    expect(headingCell.value).toBe('KEY');
    expect(worksheet.getCell('A1').alignment.horizontal).toBe('center');
    expect(worksheet.getCell('A1').alignment.vertical).toBe('middle');
    expect(worksheet.getRow(1).height).toBe(54.75);

    // Test description
    const descriptionCell = worksheet.getCell('A2');
    expect(descriptionCell.value).toBe(keySheetDescription);
    expect(descriptionCell.alignment.wrapText).toBe(true);
    expect(descriptionCell.alignment.vertical).toBe('middle');
    expect(worksheet.getRow(2).height).toBe(69.75);

    // Test empty row
    expect(worksheet.getRow(3).height).toBe(24.75);

    // Test table heading
    const tableHeadingCell = worksheet.getCell('A4');
    expect(tableHeadingCell.value).toBe('CQL Data Type Formatting');
    expect(tableHeadingCell.alignment.horizontal).toBe('center');
    expect(tableHeadingCell.alignment.vertical).toBe('middle');
    expect(tableHeadingCell.border.bottom.style).toBe('thin');
    expect(tableHeadingCell.border.bottom.color.argb).toBe('000000');
    expect(worksheet.getRow(4).height).toBe(18);

    // Test table
    const table = worksheet.getTable('Key');
    expect(table).toBeDefined();

    // Test font style, alignment, and border for column headers
    const headerRow = worksheet.getRow(5);
    headerRow.eachCell((cell) => {
      expect(cell.font.bold).toBe(true);
      expect(cell.font.color.argb).toBe('000000');
      expect(cell.font.name).toBe('Arial');
      expect(cell.font.size).toBe(14);
      expect(cell.fill.type).toBe('pattern');
      expect(cell.alignment.vertical).toBe('middle');
      expect(cell.border.bottom.style).toBe('thin');
      expect(cell.border.bottom.color.argb).toBe('D4D4D4');
      expect(cell.border.right.style).toBe('thin');
      expect(cell.border.right.color.argb).toBe('D4D4D4');
    });

    // Test font style, alignment, and border for data cells
    const dataRows = worksheet.getRows(6, worksheet.rowCount - 5);
    dataRows.forEach((row) => {
      row.eachCell((cell) => {
        expect(cell.font.color.argb).toBe('000000');
        expect(cell.font.name).toBe('Arial');
        expect(cell.font.size).toBe(14);
        expect(cell.alignment.wrapText).toBe(true);
        expect(cell.alignment.vertical).toBe('middle');
        expect(cell.border.bottom.style).toBe('thin');
        expect(cell.border.bottom.color.argb).toBe('D4D4D4');
        expect(cell.border.right.style).toBe('thin');
        expect(cell.border.right.color.argb).toBe('D4D4D4');
      });
    });
  });
});
