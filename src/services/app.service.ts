import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import {
  defaultKeySheetFontStyle,
  keySheetColumnsData,
  keySheetDescription,
  keySheetRowsData,
} from './static/KeySheetData';

@Injectable()
export class AppService {
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
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheetHeadingCell.font = { bold: true, name: 'Arial', size: 20 };
    worksheet.getRow(1).height = 54.75;

    // Add worksheet description
    const worksheetDescriptionRow = worksheet.addRow([keySheetDescription]);
    worksheet.mergeCells('A2:C2');
    worksheet.getRow(2).height = 69.75;
    const worksheetDescriptionCell = worksheetDescriptionRow.getCell(1);
    worksheetDescriptionCell.alignment = { wrapText: true, vertical: 'middle' };
    worksheetDescriptionCell.font = { name: 'Arial', size: 14 };

    // Add empty row
    worksheet.addRow([]);
    worksheet.mergeCells('A3:C3');
    worksheet.getRow(3).height = 24.75;

    // Add the table heading
    const tableHeadingRow = worksheet.addRow(['CQL Data Type Formatting']);
    worksheet.mergeCells('A4:C4');
    worksheet.getRow(4).height = 18;
    const tableHeadingCell = tableHeadingRow.getCell(1);
    tableHeadingCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tableHeadingCell.border = {
      bottom: { style: 'thin', color: { argb: '000000' } },
    };
    tableHeadingCell.font = {
      ...defaultKeySheetFontStyle,
      bold: true,
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
      cell.font = {
        ...defaultKeySheetFontStyle,
        bold: true,
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' },
      };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'D4D4D4' } },
        right: { style: 'thin', color: { argb: 'D4D4D4' } },
      };
    });

    // Set font style for data cells
    const dataRows = worksheet.getRows(
      tableStartRow + 1,
      worksheet.rowCount - tableStartRow,
    );
    dataRows.forEach((row) => {
      //row.height = 18;
      row.eachCell((cell) => {
        cell.font = defaultKeySheetFontStyle;
        cell.alignment = { wrapText: true, vertical: 'middle' };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'D4D4D4' } },
          right: { style: 'thin', color: { argb: 'D4D4D4' } },
        };
      });
    });
  }
}
