import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  GenerateUserExportDto,
  UserExportRowDto,
} from './GenerateUserExportDto';

describe('GenerateUserExportDto', () => {
  it('passes validation with an empty rows array', async () => {
    const dto = plainToInstance(GenerateUserExportDto, { rows: [] });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('passes validation with well-formed string rows', async () => {
    const dto = plainToInstance(GenerateUserExportDto, {
      rows: [
        { userDisplayName: 'Jane Doe', firstName: 'Jane', harpId: 'H1' },
        { userDisplayName: 'John Roe', sharedLibraryUpdated: '2026-01-01' },
      ],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('fails validation when rows is not an array', async () => {
    const dto = plainToInstance(GenerateUserExportDto, {
      rows: 'not-an-array',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('rows');
    expect(errors[0].constraints).toHaveProperty('isArray');
  });

  it('fails validation when a nested row field is not a string', async () => {
    const dto = plainToInstance(GenerateUserExportDto, {
      rows: [{ firstName: 123 }],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('rows');
    // Nested failure is reported against the row's field
    const nested = errors[0].children?.[0]?.children?.[0];
    expect(nested?.property).toBe('firstName');
    expect(nested?.constraints).toHaveProperty('isString');
  });

  it('allows a fully-populated 33-field row', async () => {
    const row: UserExportRowDto = {
      userDisplayName: 'a',
      firstName: 'b',
      lastName: 'c',
      harpId: 'd',
      emailAddress: 'e',
      userStatus: 'f',
      roles: 'g',
      approval: 'h',
      lastLogin: 'i',
      ownedMeasureName: 'j',
      ownedMeasureVersion: 'k',
      ownedMeasureStatus: 'l',
      ownedMeasureModel: 'm',
      ownedMeasureCmsId: 'n',
      ownedMeasureUpdated: 'o',
      sharedMeasureName: 'p',
      sharedMeasureVersion: 'q',
      sharedMeasureStatus: 'r',
      sharedMeasureModel: 's',
      sharedMeasureCmsId: 't',
      sharedMeasureOwner: 'u',
      sharedMeasureUpdated: 'v',
      ownedLibraryName: 'w',
      ownedLibraryVersion: 'x',
      ownedLibraryStatus: 'y',
      ownedLibraryModel: 'z',
      ownedLibraryUpdated: 'aa',
      sharedLibraryName: 'bb',
      sharedLibraryVersion: 'cc',
      sharedLibraryStatus: 'dd',
      sharedLibraryModel: 'ee',
      sharedLibraryOwner: 'ff',
      sharedLibraryUpdated: 'gg',
    };
    const dto = plainToInstance(GenerateUserExportDto, { rows: [row] });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
