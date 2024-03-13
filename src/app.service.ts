import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getExport(): any {
    // Require library
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const excel = require('excel4node');

    // Create a new instance of a Workbook class
    const workbook = new excel.Workbook();

    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Create a reusable style
    const style = workbook.createStyle({
      font: {
        color: '#FF0800',
        size: 12,
      },
      numberFormat: '$#,##0.00; ($#,##0.00); -',
    });

    // Set value of cell A1 to 100 as a number type styled with paramaters of style
    worksheet.cell(1, 1).number(1230).style(style);

    // Set value of cell B1 to 300 as a number type styled with paramaters of style
    worksheet.cell(1, 2).number(2400).style(style);

    // Set value of cell C1 to a formula styled with paramaters of style
    worksheet.cell(1, 3).formula('A1 + B1').style(style);

    // Set value of cell A2 to 'string' styled with paramaters of style
    worksheet.cell(2, 1).string('string').style(style);

    // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
    worksheet
      .cell(3, 1)
      .bool(true)
      .style(style)
      .style({ font: { size: 14 } });

    return workbook;
  }
}
