import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import {
  keySheetColumnsData,
  keySheetDescription,
  keySheetRowsData,
} from './static/KeySheetData';
import {
  defaultKeySheetAlignmentStyle,
  defaultKeySheetBorderStyle,
  defaultKeySheetFontStyle,
} from '../styles/keySheetStyles';
import {
  TestCaseExecutionResultDto,
  TestCaseExcelExportDto,
  PopulationDto,
} from '@madie/madie-models';

@Injectable()
export class ExportService {
  async generateXlsx(
    testCaseExcelExportDtos: TestCaseExcelExportDto[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    //Generate Key worksheet
    const keyWorkSheet = workbook.addWorksheet('KEY');
    this.generateKeyWorksheet(keyWorkSheet);

    //Generate other worksheets as needed
    const groupNumber = testCaseExcelExportDtos[0].groupNumber;
    const populationWorksheet = workbook.addWorksheet(
      `${groupNumber} - Population Criteria Section`,
    );
    this.generatePopulationWorksheet(
      populationWorksheet,
      testCaseExcelExportDtos[0],
    );

    // Return final workbook
    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }

  public generateKeyWorksheet(worksheet: ExcelJS.Worksheet) {
    // Set columns
    const columns = ['A', 'B', 'C'];
    columns.forEach((columnLetter) => {
      const column = worksheet.getColumn(columnLetter);
      column.width = 76.38;
    });

    // Add worksheet heading
    const worksheetHeadingRow = worksheet.addRow(['KEY']);
    worksheet.mergeCells('A1:C1');
    const worksheetHeadingCell = worksheetHeadingRow.getCell(1);
    worksheetHeadingCell.alignment = {
      ...defaultKeySheetAlignmentStyle,
      horizontal: 'center',
    };
    worksheetHeadingCell.font = { ...defaultKeySheetFontStyle, size: 20 };
    worksheet.getRow(1).height = 54.75;

    // Add worksheet description
    const worksheetDescriptionRow = worksheet.addRow([keySheetDescription]);
    worksheet.mergeCells('A2:C2');
    worksheet.getRow(2).height = 69.75;
    const worksheetDescriptionCell = worksheetDescriptionRow.getCell(1);
    worksheetDescriptionCell.alignment = defaultKeySheetAlignmentStyle;
    worksheetDescriptionCell.font = {
      ...defaultKeySheetFontStyle,
      bold: false,
    };

    // Add empty row
    worksheet.addRow([]);
    worksheet.mergeCells('A3:C3');
    worksheet.getRow(3).height = 24.75;

    // Add the table heading
    const tableHeadingRow = worksheet.addRow(['CQL Data Type Formatting']);
    worksheet.mergeCells('A4:C4');
    worksheet.getRow(4).height = 18;
    const tableHeadingCell = tableHeadingRow.getCell(1);
    tableHeadingCell.alignment = {
      ...defaultKeySheetAlignmentStyle,
      horizontal: 'center',
    };
    tableHeadingCell.border = {
      bottom: { ...defaultKeySheetBorderStyle, color: { argb: '000000' } }, //need to check
    };
    tableHeadingCell.font = {
      ...defaultKeySheetFontStyle,
      size: 16,
    };

    // Add table
    const tableStartRow = 5;
    worksheet.addTable({
      name: 'Key',
      ref: 'A5',
      headerRow: true,
      columns: keySheetColumnsData,
      rows: keySheetRowsData,
    });

    // Set font style and background color for column headers
    const headerRow = worksheet.getRow(tableStartRow);
    headerRow.height = 18;
    headerRow.eachCell((cell) => {
      cell.font = defaultKeySheetFontStyle;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' },
      };
      cell.alignment = defaultKeySheetAlignmentStyle;
      cell.border = {
        bottom: defaultKeySheetBorderStyle,
        right: defaultKeySheetBorderStyle,
      };
    });

    // Set font style for data cells
    const dataRows = worksheet.getRows(
      tableStartRow + 1,
      worksheet.rowCount - tableStartRow,
    );
    dataRows.forEach((row) => {
      row.eachCell((cell) => {
        cell.font = { ...defaultKeySheetFontStyle, bold: false };
        cell.alignment = defaultKeySheetAlignmentStyle;
        cell.border = {
          bottom: defaultKeySheetBorderStyle,
          right: defaultKeySheetBorderStyle,
        };
      });
    });
  }

  public generatePopulationWorksheet(
    worksheet: ExcelJS.Worksheet,
    testCaseGroupDto: TestCaseExcelExportDto,
  ) {
    let firstRow = [];
    let headerRow = [];
    const testCasesData = [];
    //failed test cases will have red text font
    const failedIndexes = [];
    let index: number = 3;
    testCaseGroupDto.testCaseExecutionResults.forEach(
      (result: TestCaseExecutionResultDto) => {
        const firstRowData = [];
        const headerRowData = [];
        const testCaseData = [];
        const populations: PopulationDto[] =
          this.getPopulations(testCaseGroupDto);

        populations?.forEach((population) => {
          firstRowData.push('Expected', 'Actual');
          headerRowData.push(population.name, population.name);
          this.populateTestCaseExpectedAndActual(
            testCaseData,
            result,
            population,
            index,
            failedIndexes,
          );
        });

        this.populateTestCase(testCaseData, result);
        testCasesData.push(testCaseData);
        firstRow = firstRowData;
        headerRow = headerRowData;
        index += 1;
      },
    );
    this.populateFirstRow(worksheet, firstRow);

    this.populateHeaderRow(
      worksheet,
      headerRow,
      testCaseGroupDto.testCaseExecutionResults[0],
    );

    testCasesData.forEach((testCaseData) => {
      worksheet.addRow(testCaseData);
    });
    failedIndexes.forEach((index) => {
      worksheet.getRow(index).font = { color: { argb: 'ff0000' } };
    });
    this.adjustColumnWidth(worksheet);
  }

  private getPopulations = (testCaseExcelExportDto: TestCaseExcelExportDto) => {
    let populations: PopulationDto[] = [];
    testCaseExcelExportDto.testCaseExecutionResults?.forEach(
      (result: TestCaseExecutionResultDto) => {
        if (result.populations?.length > 0) {
          populations = result.populations;
        }
      },
    );
    return populations;
  };

  private populateTestCaseExpectedAndActual(
    testCaseData,
    result: TestCaseExecutionResultDto,
    population: PopulationDto,
    index: number,
    failedIndexes: number[],
  ) {
    let foundPopulation: PopulationDto = null;
    result.populations?.forEach((currentPopulation) => {
      if (currentPopulation.name === population.name) {
        foundPopulation = currentPopulation;
      }
    });
    testCaseData.push(foundPopulation?.expected, foundPopulation?.actual);
    if (foundPopulation?.expected !== foundPopulation?.actual) {
      if (failedIndexes.indexOf(index) === -1) {
        //if not in the array
        failedIndexes.push(index);
      }
    }
    return foundPopulation;
  }

  private populateFirstRow(worksheet, firstRowData) {
    worksheet.addRow(firstRowData);
    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell) => {
      cell.font = { ...defaultKeySheetFontStyle, bold: true };
      cell.alignment = defaultKeySheetAlignmentStyle;
      cell.border = {
        bottom: defaultKeySheetBorderStyle,
        right: defaultKeySheetBorderStyle,
      };
    });
  }
  private populateHeaderRow(
    worksheet,
    headerRowData,
    result: TestCaseExecutionResultDto,
  ) {
    headerRowData.push(
      'notes',
      'last',
      'first',
      'birthdate',
      'expired',
      'deathdate',
      'ethnicity',
      'race',
      'gender',
    );
    if (result.definitions && result.definitions.length > 0) {
      result.definitions.forEach((definition) => {
        headerRowData.push(definition.logic);
      });
    }
    if (result.functions && result.functions.length > 0) {
      result.functions.forEach((func) => {
        headerRowData.push(func.logic);
      });
    }
    worksheet.addRow(headerRowData);
    const headerRow = worksheet.getRow(2);
    headerRow.eachCell((cell) => {
      cell.font = { ...defaultKeySheetFontStyle, size: 12 };
      cell.alignment = defaultKeySheetAlignmentStyle;
      cell.border = {
        bottom: defaultKeySheetBorderStyle,
        right: defaultKeySheetBorderStyle,
      };
    });
  }

  private populateTestCase(testCaseData, result: TestCaseExecutionResultDto) {
    testCaseData.push(
      '',
      result.last,
      result.first,
      result.birthdate,
      'FALSE',
      '',
      result.ethnicity,
      result.race,
      result.gender,
    );
    if (result.definitions && result.definitions.length > 0) {
      result.definitions.forEach((definition) => {
        testCaseData.push(definition.actual);
      });
    }
    if (result.functions && result.functions.length > 0) {
      result.functions.forEach((func) => {
        testCaseData.push(func.actual);
      });
    }
  }

  private adjustColumnWidth(worksheet) {
    worksheet.columns.forEach((column) => {
      const lengths = column.values.map((v) => v.toString().length);
      const values = column.values.map((v) => v.toString());
      const maxLength = Math.max(
        ...lengths.filter((v) => typeof v === 'number'),
      );
      if (values?.[2]?.includes('define')) {
        column.width = 40;
      } else {
        column.width = maxLength + 3;
      }
      column.height = 40;
    });
  }
}
