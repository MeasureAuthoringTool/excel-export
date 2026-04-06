import { ExportService } from './export.service';
import * as ExcelJS from 'exceljs';
import { keySheetDescription } from './static/KeySheetData';
import {
  TestCaseExcelExportDto,
  OverlappingCodeDto,
} from '@madie/madie-models';
import { MeasureAccessReportDTO } from '../dto/MeasureAccessReportDTO';
import { LibraryAccessReportDTO } from '../dto/LibraryAccessReportDTO';

describe('ExcelService', () => {
  let excelExportService: ExportService;
  const exportDto: TestCaseExcelExportDto = {
    groupId: 'testGroupId',
    groupNumber: '1',
    testCaseExecutionResults: [
      {
        testCaseId: 'testCaseId1',
        populations: [
          {
            name: 'initialPopulation',
            expected: 1,
            actual: 2,
            pass: false,
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
        stratifications: [
          {
            testCaseId: 'testCaseId1',
            stratId: 'stratId1',
            stratName: 'PopSet1 Stratification 1',
            stratificationDtos: [
              {
                id: 'stratId1',
                name: 'STRAT',
                expected: 11,
                actual: 0,
                pass: false,
              },
              {
                id: 'f0b3c08d-1164-48d8-bc71-aed87499099f',
                name: 'initialPopulation',
                expected: 11,
                actual: 0,
                pass: false,
              },
              {
                id: 'f0b3c08d-1164-48d8-bc71-aed87499099f',
                name: 'denominator',
                expected: 11,
                actual: 0,
                pass: false,
              },
              {
                id: 'f0b3c08d-1164-48d8-bc71-aed87499099f',
                name: 'numerator',
                expected: 11,
                actual: 0,
                pass: false,
              },
            ],
          },
        ],
      },
      {
        testCaseId: 'testCaseId2',
        populations: [
          {
            name: 'initialPopulation',
            expected: 2,
            actual: 2,
            pass: true,
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

  const overlappingCodeDtos: OverlappingCodeDto[] = [
    {
      code: '4525004',
      description: 'Emergency department patient visit (procedure)',
      codeSystem: 'http://snomed.info/sct',
      codeSystemVersion: 'http://snomed.info/sct/731000124108/version/20250301',
      codeSystemName: 'http://snomed.info/sct',
      valueSets: [
        {
          name: 'EmergencyDepartmentEvaluationAndManagementVisit',
          oid: '',
          url: 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1010',
        },
        {
          name: 'EmergencyDepartmentVisit',
          oid: '2.16.840.1.113883.3.117.1.7.1.292',
          url: '',
        },
      ],
    },
  ];

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
    expect(worksheet.getCell(2, 11).value).toBe('sex');
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
    await workbook.xlsx.load(buffer as any);

    const keyWorkSheet = workbook.getWorksheet('KEY');
    expect(keyWorkSheet).not.toBe(null);

    const populationCriteria1WorkSheet = workbook.getWorksheet(
      '1 - Population Criteria Section',
    );
    expect(populationCriteria1WorkSheet).not.toBe(null);

    const strat1WorkSheet = workbook.getWorksheet(
      '2 - PopSet1 Stratification 1',
    );
    expect(strat1WorkSheet).not.toBe(null);
    expect(strat1WorkSheet.getRows.length).toBe(2);
    expect(strat1WorkSheet.getCell(1, 1).value).toBe('Expected');
    expect(strat1WorkSheet.getCell(1, 5).value).toBe('Actual');

    expect(strat1WorkSheet.getCell(2, 1).value).toBe('STRAT');
    expect(strat1WorkSheet.getCell(2, 2).value).toBe('initialPopulation');
    expect(strat1WorkSheet.getCell(2, 3).value).toBe('denominator');
    expect(strat1WorkSheet.getCell(2, 4).value).toBe('numerator');
    expect(strat1WorkSheet.getCell(2, 5).value).toBe('STRAT');
    expect(strat1WorkSheet.getCell(2, 6).value).toBe('initialPopulation');
    expect(strat1WorkSheet.getCell(2, 7).value).toBe('denominator');
    expect(strat1WorkSheet.getCell(2, 8).value).toBe('numerator');

    expect(strat1WorkSheet.getCell(3, 1).value).toBe(11);
    expect(strat1WorkSheet.getCell(3, 2).value).toBe(11);
    expect(strat1WorkSheet.getCell(3, 3).value).toBe(11);
    expect(strat1WorkSheet.getCell(3, 4).value).toBe(11);
    expect(strat1WorkSheet.getCell(3, 5).value).toBe(0);
    expect(strat1WorkSheet.getCell(3, 6).value).toBe(0);
    expect(strat1WorkSheet.getCell(3, 7).value).toBe(0);
    expect(strat1WorkSheet.getCell(3, 8).value).toBe(0);
  });

  it('test generateOverlappingCodeXlsx', async () => {
    const buffer =
      await excelExportService.generateOverlappingCodeXlsx(overlappingCodeDtos);
    expect(buffer).not.toBe(null);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const overlappingCodesWorkSheet =
      workbook.getWorksheet('Overlapping Codes');
    expect(overlappingCodesWorkSheet).not.toBe(null);
    expect(overlappingCodesWorkSheet.getRows.length).toBe(2);
    expect(overlappingCodesWorkSheet.getCell(1, 1).value).toBe('Code');
    expect(overlappingCodesWorkSheet.getCell(1, 2).value).toBe('Code System');
    expect(overlappingCodesWorkSheet.getCell(1, 3).value).toBe('Description');
    expect(overlappingCodesWorkSheet.getCell(1, 4).value).toBe('Version');
    expect(overlappingCodesWorkSheet.getCell(1, 5).value).toBe('Value Set');
    expect(overlappingCodesWorkSheet.getCell(1, 6).value).toBe(
      'Value Set OID/URL',
    );

    expect(overlappingCodesWorkSheet.getCell(2, 1).value).toBe('4525004');
    expect(overlappingCodesWorkSheet.getCell(2, 2).value).toBe(
      'http://snomed.info/sct',
    );
    expect(overlappingCodesWorkSheet.getCell(2, 3).value).toBe(
      'Emergency department patient visit (procedure)',
    );
    expect(overlappingCodesWorkSheet.getCell(2, 4).value).toBe(
      'http://snomed.info/sct/731000124108/version/20250301',
    );
    expect(overlappingCodesWorkSheet.getCell(2, 5).value).toBe(
      'EmergencyDepartmentEvaluationAndManagementVisit',
    );
    expect(overlappingCodesWorkSheet.getCell(2, 6).value).toBe(
      'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1010',
    );

    expect(overlappingCodesWorkSheet.getCell(3, 1).value).toBe('4525004');
    expect(overlappingCodesWorkSheet.getCell(3, 2).value).toBe(
      'http://snomed.info/sct',
    );
    expect(overlappingCodesWorkSheet.getCell(3, 3).value).toBe(
      'Emergency department patient visit (procedure)',
    );
    expect(overlappingCodesWorkSheet.getCell(3, 4).value).toBe(
      'http://snomed.info/sct/731000124108/version/20250301',
    );
    expect(overlappingCodesWorkSheet.getCell(3, 5).value).toBe(
      'EmergencyDepartmentVisit',
    );
    expect(overlappingCodesWorkSheet.getCell(3, 6).value).toBe(
      '2.16.840.1.113883.3.117.1.7.1.292',
    );
  });

  it('test getExpandedList', async () => {
    const newDtos = excelExportService.getExpandedList(overlappingCodeDtos);
    expect(newDtos.length).toBe(2);

    const newOverlappingCodeDto = newDtos[0];
    newOverlappingCodeDto.valueSets = null;
    const newDtos2 = excelExportService.getExpandedList([
      newOverlappingCodeDto,
    ]);
    expect(newDtos2.length).toBe(1);
  });

  describe('generateSharedAccessReportForMeasures', () => {
    const singleSharedMeasure: MeasureAccessReportDTO = {
      id: 'measure-id-1',
      measureName: 'Test Measure',
      measureModel: 'QI-Core v4.1.1',
      cmsId: 'CMS001',
      owner: 'owner1',
      sharedWith: [
        { userId: 'user1', dateShared: '2026-01-15' },
        { userId: 'user2', dateShared: '2026-02-20' },
      ],
    };

    const noSharesMeasure: MeasureAccessReportDTO = {
      id: 'measure-id-2',
      measureName: 'Unshared Measure',
      measureModel: 'QDM v5.6',
      cmsId: 'CMS002',
      owner: 'owner2',
      sharedWith: [],
    };

    const nullSharedWithMeasure: MeasureAccessReportDTO = {
      id: 'measure-id-3',
      measureName: 'Null Shared Measure',
      measureModel: 'QI-Core v4.1.1',
      cmsId: 'CMS003',
      owner: 'owner3',
      sharedWith: null,
    };

    it('should write the correct header row', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForMeasures([
          singleSharedMeasure,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Measure Sharing Report');

      expect(ws.getCell(1, 1).value).toBe('Measure Name');
      expect(ws.getCell(1, 2).value).toBe('Model');
      expect(ws.getCell(1, 3).value).toBe('CMS ID');
      expect(ws.getCell(1, 4).value).toBe('Current Measure Owner');
      expect(ws.getCell(1, 5).value).toBe('Shared With');
      expect(ws.getCell(1, 6).value).toBe('Date Shared');
    });

    it('should emit one row per shared user, populating measure columns only on the first row', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForMeasures([
          singleSharedMeasure,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Measure Sharing Report');

      // First shared-user row (row 2): measure columns should be populated
      expect(ws.getCell(2, 1).value).toBe('Test Measure');
      expect(ws.getCell(2, 2).value).toBe('QI-Core v4.1.1');
      expect(ws.getCell(2, 3).value).toBe('CMS001');
      expect(ws.getCell(2, 4).value).toBe('owner1');
      expect(ws.getCell(2, 5).value).toBe('user1');
      expect(ws.getCell(2, 6).value).toBe('2026-01-15');

      // Second shared-user row (row 3): measure columns should be blank
      expect(ws.getCell(3, 1).value).toBe('');
      expect(ws.getCell(3, 2).value).toBe('');
      expect(ws.getCell(3, 3).value).toBe('');
      expect(ws.getCell(3, 4).value).toBe('');
      expect(ws.getCell(3, 5).value).toBe('user2');
      expect(ws.getCell(3, 6).value).toBe('2026-02-20');
    });

    it('should emit a single row with empty userId and dateShared when sharedWith is empty', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForMeasures([
          noSharesMeasure,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Measure Sharing Report');

      expect(ws.getCell(2, 1).value).toBe('Unshared Measure');
      expect(ws.getCell(2, 2).value).toBe('QDM v5.6');
      expect(ws.getCell(2, 3).value).toBe('CMS002');
      expect(ws.getCell(2, 4).value).toBe('owner2');
      expect(ws.getCell(2, 5).value).toBe('');
      expect(ws.getCell(2, 6).value).toBe('');

      // No third row should exist
      expect(ws.getRow(3).getCell(1).value).toBeNull();
    });

    it('should treat null sharedWith the same as an empty array', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForMeasures([
          nullSharedWithMeasure,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Measure Sharing Report');

      expect(ws.getCell(2, 1).value).toBe('Null Shared Measure');
      expect(ws.getCell(2, 5).value).toBe('');
      expect(ws.getCell(2, 6).value).toBe('');
    });

    it('should handle multiple measures in a single report', async () => {
      const anotherMeasure: MeasureAccessReportDTO = {
        id: 'measure-id-4',
        measureName: 'Second Measure',
        measureModel: 'QDM v5.6',
        cmsId: 'CMS004',
        owner: 'owner4',
        sharedWith: [{ userId: 'user3', dateShared: '2026-03-01' }],
      };

      const buffer =
        await excelExportService.generateSharedAccessReportForMeasures([
          singleSharedMeasure,
          anotherMeasure,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Measure Sharing Report');

      // singleSharedMeasure has 2 shared users → rows 2 & 3
      expect(ws.getCell(2, 1).value).toBe('Test Measure');
      expect(ws.getCell(3, 1).value).toBe('');

      // anotherMeasure has 1 shared user → row 4
      expect(ws.getCell(4, 1).value).toBe('Second Measure');
      expect(ws.getCell(4, 5).value).toBe('user3');
      expect(ws.getCell(4, 6).value).toBe('2026-03-01');
    });
  });

  describe('generateSharedAccessReportForLibraries', () => {
    const singleSharedLibrary: LibraryAccessReportDTO = {
      id: 'library-id-1',
      libraryName: 'Test Library',
      libraryModel: 'QI-Core v4.1.1',
      owner: 'owner1',
      sharedWith: [
        { userId: 'user1', dateShared: '2026-01-15' },
        { userId: 'user2', dateShared: '2026-02-20' },
      ],
    };

    const noSharesLibrary: LibraryAccessReportDTO = {
      id: 'library-id-2',
      libraryName: 'Unshared Library',
      libraryModel: 'QDM v5.6',
      owner: 'owner2',
      sharedWith: [],
    };

    const nullSharedWithLibrary: LibraryAccessReportDTO = {
      id: 'library-id-3',
      libraryName: 'Null Shared Library',
      libraryModel: 'QI-Core v4.1.1',
      owner: 'owner3',
      sharedWith: null,
    };

    it('should write the correct header row', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForLibraries([
          singleSharedLibrary,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Library Sharing Report');

      expect(ws.getCell(1, 1).value).toBe('Library Name');
      expect(ws.getCell(1, 2).value).toBe('Model');
      expect(ws.getCell(1, 3).value).toBe('Current Library Owner');
      expect(ws.getCell(1, 4).value).toBe('Shared With');
      expect(ws.getCell(1, 5).value).toBe('Date Shared');
    });

    it('should emit one row per shared user, populating library columns only on the first row', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForLibraries([
          singleSharedLibrary,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Library Sharing Report');

      // First shared-user row (row 2): library columns should be populated
      expect(ws.getCell(2, 1).value).toBe('Test Library');
      expect(ws.getCell(2, 2).value).toBe('QI-Core v4.1.1');
      expect(ws.getCell(2, 3).value).toBe('owner1');
      expect(ws.getCell(2, 4).value).toBe('user1');
      expect(ws.getCell(2, 5).value).toBe('2026-01-15');

      // Second shared-user row (row 3): library columns should be blank
      expect(ws.getCell(3, 1).value).toBe('');
      expect(ws.getCell(3, 2).value).toBe('');
      expect(ws.getCell(3, 3).value).toBe('');
      expect(ws.getCell(3, 4).value).toBe('user2');
      expect(ws.getCell(3, 5).value).toBe('2026-02-20');
    });

    it('should emit a single row with empty userId and dateShared when sharedWith is empty', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForLibraries([
          noSharesLibrary,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Library Sharing Report');

      expect(ws.getCell(2, 1).value).toBe('Unshared Library');
      expect(ws.getCell(2, 2).value).toBe('QDM v5.6');
      expect(ws.getCell(2, 3).value).toBe('owner2');
      expect(ws.getCell(2, 4).value).toBe('');
      expect(ws.getCell(2, 5).value).toBe('');

      // No third row should exist
      expect(ws.getRow(3).getCell(1).value).toBeNull();
    });

    it('should treat null sharedWith the same as an empty array', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForLibraries([
          nullSharedWithLibrary,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Library Sharing Report');

      expect(ws.getCell(2, 1).value).toBe('Null Shared Library');
      expect(ws.getCell(2, 4).value).toBe('');
      expect(ws.getCell(2, 5).value).toBe('');
    });

    it('should handle multiple libraries in a single report', async () => {
      const anotherLibrary: LibraryAccessReportDTO = {
        id: 'library-id-4',
        libraryName: 'Second Library',
        libraryModel: 'QDM v5.6',
        owner: 'owner4',
        sharedWith: [{ userId: 'user3', dateShared: '2026-03-01' }],
      };

      const buffer =
        await excelExportService.generateSharedAccessReportForLibraries([
          singleSharedLibrary,
          anotherLibrary,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Library Sharing Report');

      // singleSharedLibrary has 2 shared users → rows 2 & 3
      expect(ws.getCell(2, 1).value).toBe('Test Library');
      expect(ws.getCell(3, 1).value).toBe('');

      // anotherLibrary has 1 shared user → row 4
      expect(ws.getCell(4, 1).value).toBe('Second Library');
      expect(ws.getCell(4, 4).value).toBe('user3');
      expect(ws.getCell(4, 5).value).toBe('2026-03-01');
    });

    it('should handle an empty array of libraries', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForLibraries([]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Library Sharing Report');

      // Only header row should exist
      expect(ws.getCell(1, 1).value).toBe('Library Name');
      expect(ws.getRow(2).getCell(1).value).toBeNull();
    });

    it('should format the header row with correct styles', async () => {
      const buffer =
        await excelExportService.generateSharedAccessReportForLibraries([
          singleSharedLibrary,
        ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const ws = workbook.getWorksheet('Library Sharing Report');
      const headerRow = ws.getRow(1);

      headerRow.eachCell((cell) => {
        expect(cell.font.bold).toBe(true);
        expect(cell.font.color.argb).toBe('FFFFFF');
        expect((cell.fill as ExcelJS.FillPattern).fgColor.argb).toBe('34BABF');
      });
    });
  });
});
