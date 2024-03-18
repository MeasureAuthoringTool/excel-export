export const keySheetRowsData = [
  ['DateTime', 'MM/DD/YYYY h:mm AM/PM or MM/DD/YYYY', '11/20/2019  8:00:00 AM'],
  [
    'Interval',
    'INTERVAL: start value - end value',
    'INTERVAL: 11/20/2017 - 11/20/2024 or INTERVAL: 1 - 4',
  ],
  ['Code', 'CODE: system code', 'CODE: SNOMED-CT 8715000'],
  ['Quantity', 'QUANTITY: value unit', 'QUANTITY: 120 mm[Hg]'],
  [
    'QDM Data Criteria',
    'QDM Datatype: Value Set \n' +
      'START: MM/DD/YYYY h:mm AM/PM \n' +
      'STOP: MM/DD/YYYY h:mm AM/PM \n' +
      'CODE: system code \n' +
      '* STOP entry is optional \n' +
      '* only the first code on the data criteria is shown',
    'Medication, Order: Opioid Medications \n' +
      'START: 01/01/2024 8:00 AM \n' +
      'CODE: RxNorm 1053647',
  ],
  [
    'List',
    '[item one, \n' + 'item two, \n' + '...]',
    '[Encounter, Performed: Emergency Department Visit \n' +
      'START: 06/10/2024 5:00 AM \n' +
      'STOP: 06/10/2024 5:25 AM \n' +
      'CODE: SNOMED-CT 4525004, \n' +
      'Encounter, Performed: Emergency Department Visit \n' +
      'START: 06/10/2024 9:00 AM \n' +
      'STOP: 06/10/2024 9:15 AM \n' +
      'CODE: SNOMED-CT 4525004]',
  ],
  [
    'Tuple',
    '{ \n' + 'key1: value1, \n' + 'key2: value2, \n' + '... \n' + '}',
    '{ \n' +
      ' period: Interval: 06/29/2017 8:00 AM - 12/31/2024 11:59 PM, \n' +
      ' meds: [Medication, Order: Opioid Medications \n' +
      '        START: 06/29/2024 8:00 AM \n' +
      '        CODE: RxNorm 996994], \n' +
      ' cmd: 185 \n' +
      '}',
  ],
];

export const keySheetColumnsData = [
  { name: 'CQL Type' },
  { name: 'Format' },
  { name: 'Example' },
];

export const keySheetDescription = `NOTE: FALSE(...) indicates a false value. The type of falseness is specified in the parentheses.\nFor example, FALSE([]) indicates falseness due to an empty list.\nCells that are too long will be truncated due to limitations in Excel.`;

export const defaultKeySheetFontStyle = {
  color: { argb: '000000' },
  name: 'Arial',
  size: 14,
};
