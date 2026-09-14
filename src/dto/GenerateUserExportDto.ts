import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * A single row in the Full User Export workbook.
 *
 * Every field is an optional string and the field order below maps 1:1 to the
 * 33 columns defined in {@link USER_EXPORT_COLUMNS}. When adding/removing a
 * field, keep it in sync with that column definition (single source of truth).
 */
export class UserExportRowDto {
  // --- User Metadata (columns 1–9) ---
  @IsOptional()
  @IsString()
  userDisplayName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  harpId?: string;

  @IsOptional()
  @IsString()
  emailAddress?: string;

  @IsOptional()
  @IsString()
  userStatus?: string;

  @IsOptional()
  @IsString()
  roles?: string;

  @IsOptional()
  @IsString()
  approval?: string;

  @IsOptional()
  @IsString()
  lastLogin?: string;

  // --- User's Owned Measures (columns 10–15) ---
  @IsOptional()
  @IsString()
  ownedMeasureName?: string;

  @IsOptional()
  @IsString()
  ownedMeasureVersion?: string;

  @IsOptional()
  @IsString()
  ownedMeasureStatus?: string;

  @IsOptional()
  @IsString()
  ownedMeasureModel?: string;

  @IsOptional()
  @IsString()
  ownedMeasureCmsId?: string;

  @IsOptional()
  @IsString()
  ownedMeasureUpdated?: string;

  // --- Measures Shared with User (columns 16–22) ---
  @IsOptional()
  @IsString()
  sharedMeasureName?: string;

  @IsOptional()
  @IsString()
  sharedMeasureVersion?: string;

  @IsOptional()
  @IsString()
  sharedMeasureStatus?: string;

  @IsOptional()
  @IsString()
  sharedMeasureModel?: string;

  @IsOptional()
  @IsString()
  sharedMeasureCmsId?: string;

  @IsOptional()
  @IsString()
  sharedMeasureOwner?: string;

  @IsOptional()
  @IsString()
  sharedMeasureUpdated?: string;

  // --- User's Owned Libraries (columns 23–27) ---
  @IsOptional()
  @IsString()
  ownedLibraryName?: string;

  @IsOptional()
  @IsString()
  ownedLibraryVersion?: string;

  @IsOptional()
  @IsString()
  ownedLibraryStatus?: string;

  @IsOptional()
  @IsString()
  ownedLibraryModel?: string;

  @IsOptional()
  @IsString()
  ownedLibraryUpdated?: string;

  // --- Libraries Shared with User (columns 28–33) ---
  @IsOptional()
  @IsString()
  sharedLibraryName?: string;

  @IsOptional()
  @IsString()
  sharedLibraryVersion?: string;

  @IsOptional()
  @IsString()
  sharedLibraryStatus?: string;

  @IsOptional()
  @IsString()
  sharedLibraryModel?: string;

  @IsOptional()
  @IsString()
  sharedLibraryOwner?: string;

  @IsOptional()
  @IsString()
  sharedLibraryUpdated?: string;
}

/**
 * Input contract for POST /excel/user-export.
 */
export class GenerateUserExportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserExportRowDto)
  rows: UserExportRowDto[];
}
