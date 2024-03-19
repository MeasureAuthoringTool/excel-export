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

@Injectable()
export class ExportService {
  async generateXlsx(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    //Generate Key worksheet
    const keyWorkSheet = workbook.addWorksheet('KEY');
    this.generateKeyWorksheet(keyWorkSheet);

    //Generate other worksheets as needed

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
}
