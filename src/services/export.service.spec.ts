import { ExportService } from './export.service';
import * as ExcelJS from 'exceljs';
import { keySheetDescription } from './static/KeySheetData';
import { TestCaseExcelExportDto } from '@madie/madie-models';

describe('ExcelService', () => {
  let excelExportService: ExportService;
  const exportDto: TestCaseExcelExportDto = {
    groupId: 'testGroupId',
    groupNumber: '1',
    testCaseExecutionResults: [
      {
        populations: [
          {
            name: 'initialPopulation',
            expected: 1,
            actual: 2,
          },
        ],
        notes: '',
        last: 'testSeries1',
        first: 'testTitle1',
        birthdate: '11/12/1972',
        expired: '',
        deathdate: '',
        ethnicity: 'Hispanic or Latino',
        race: 'Other Race',
        gender: 'Female',
        definitions: [
          {
            logic: 'define "Denominator":\n  "Initial Population"',
            actual: 'UNHIT',
          },
        ],
        functions: [
          {
            logic: 'HospitalizationWithObservation',
            actual: 'FUNCTION',
          },
          {
            logic: 'NormalizeInterval',
            actual: 'FUNCTION',
          },
        ],
      },
      {
        populations: [
          {
            name: 'initialPopulation',
            expected: 2,
            actual: 2,
          },
        ],
        notes: '',
        last: 'testSeries2',
        first: 'testTitle2',
        birthdate: '11/12/1972',
        expired: '',
        deathdate: '',
        ethnicity: 'Hispanic or Latino',
        race: 'Other Race',
        gender: 'Female',
        definitions: [
          {
            logic: 'define "Denominator":\n  "Initial Population"',
            actual: 'UNHIT',
          },
        ],
        functions: [
          {
            logic: 'HospitalizationWithObservation',
            actual: 'FUNCTION',
          },
          {
            logic: 'NormalizeInterval',
            actual: 'FUNCTION',
          },
        ],
      },
    ],
  };
  beforeEach(() => {
    excelExportService = new ExportService();
  });
  it('should generate key worksheet correctly', () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('KEY');
    excelExportService.generateKeyWorksheet(worksheet);

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

  it('should generate population criteria 1 worksheet correctly', () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('1 - Population Criteria Section');

    excelExportService.generatePopulationWorksheet(worksheet, exportDto);

    expect(worksheet.getRow(3).cellCount).toBe(14);
    expect(worksheet.getCell(1, 1).value).toBe('Expected');
    expect(worksheet.getCell(1, 2).value).toBe('Actual');

    expect(worksheet.getCell(2, 1).value).toBe('initialPopulation');
    expect(worksheet.getCell(2, 2).value).toBe('initialPopulation');
    expect(worksheet.getCell(2, 3).value).toBe('notes');
    expect(worksheet.getCell(2, 4).value).toBe('last');
    expect(worksheet.getCell(2, 5).value).toBe('first');
    expect(worksheet.getCell(2, 6).value).toBe('birthdate');
    expect(worksheet.getCell(2, 7).value).toBe('expired');
    expect(worksheet.getCell(2, 8).value).toBe('deathdate');
    expect(worksheet.getCell(2, 9).value).toBe('ethnicity');
    expect(worksheet.getCell(2, 10).value).toBe('race');
    expect(worksheet.getCell(2, 11).value).toBe('gender');
    expect(worksheet.getCell(2, 12).value).toBe(
      'define "Denominator":\n  "Initial Population"',
    );
    expect(worksheet.getCell(2, 13).value).toBe(
      'HospitalizationWithObservation',
    );
    expect(worksheet.getCell(2, 14).value).toBe('NormalizeInterval');

    expect(worksheet.getCell(3, 1).value).toBe(1);
    expect(worksheet.getCell(3, 2).value).toBe(2);
    expect(worksheet.getCell(3, 3).value).toBe('');
    expect(worksheet.getCell(3, 4).value).toBe('testSeries1');
    expect(worksheet.getCell(3, 5).value).toBe('testTitle1');
    expect(worksheet.getCell(3, 6).value).toBe('11/12/1972');
    expect(worksheet.getCell(3, 7).value).toBe('FALSE');
    expect(worksheet.getCell(3, 8).value).toBe('');
    expect(worksheet.getCell(3, 9).value).toBe('Hispanic or Latino');
    expect(worksheet.getCell(3, 10).value).toBe('Other Race');
    expect(worksheet.getCell(3, 11).value).toBe('Female');
    expect(worksheet.getCell(3, 12).value).toBe('UNHIT');
    expect(worksheet.getCell(3, 13).value).toBe('FUNCTION');
    expect(worksheet.getCell(3, 14).value).toBe('FUNCTION');
    //failed test test cases font color is red
    expect(worksheet.getRow(3).font.color.argb).toBe('ff0000');

    expect(worksheet.getCell(4, 1).value).toBe(2);
    expect(worksheet.getCell(4, 2).value).toBe(2);
    expect(worksheet.getCell(4, 3).value).toBe('');
    expect(worksheet.getCell(4, 4).value).toBe('testSeries2');
    expect(worksheet.getCell(4, 5).value).toBe('testTitle2');
    expect(worksheet.getCell(4, 6).value).toBe('11/12/1972');
    expect(worksheet.getCell(4, 7).value).toBe('FALSE');
    expect(worksheet.getCell(4, 8).value).toBe('');
    expect(worksheet.getCell(4, 9).value).toBe('Hispanic or Latino');
    expect(worksheet.getCell(4, 10).value).toBe('Other Race');
    expect(worksheet.getCell(4, 11).value).toBe('Female');
    expect(worksheet.getCell(4, 12).value).toBe('UNHIT');
    expect(worksheet.getCell(4, 13).value).toBe('FUNCTION');
    expect(worksheet.getCell(4, 14).value).toBe('FUNCTION');
    //success test test cases font color is not red (undefined)
    expect(worksheet.getRow(4).font).toBe(undefined);
  });

  it('test generateXlsx', async () => {
    const exportDtos: TestCaseExcelExportDto[] = [exportDto];
    const buffer = await excelExportService.generateXlsx(exportDtos);
    expect(buffer).not.toBe(null);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const keyWorkSheet = workbook.getWorksheet('KEY');
    expect(keyWorkSheet).not.toBe(null);

    const populationCriteria1WorkSheet = workbook.getWorksheet(
      '1 - Population Criteria Section',
    );
    expect(populationCriteria1WorkSheet).not.toBe(null);
  });
});
