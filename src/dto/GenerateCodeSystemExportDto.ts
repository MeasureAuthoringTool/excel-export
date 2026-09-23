import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * A single row in the Code System Export workbook.
 *
 * Every field is an optional string and the field order below maps 1:1 to the
 * columns defined in {@link CODE_SYSTEM_EXPORT_COLUMNS}. When adding/removing a
 * field, keep it in sync with that column definition (single source of truth).
 */
export class CodeSystemExportRowDto {
  // --- Code System (columns 1–4) ---
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  oid?: string;

  @IsOptional()
  @IsString()
  fullUrl?: string;

  // --- Version (columns 5–8) ---
  @IsOptional()
  @IsString()
  fhirVersion?: string;

  @IsOptional()
  @IsString()
  vsacVersion?: string;

  @IsOptional()
  @IsString()
  versionId?: string;

  @IsOptional()
  @IsString()
  latestVersion?: string;

  // --- Record Details (columns 9–11) ---
  @IsOptional()
  @IsString()
  lastUpdated?: string;

  @IsOptional()
  @IsString()
  lastUpdatedUpstream?: string;

  @IsOptional()
  @IsString()
  id?: string;
}

/**
 * Input contract for PUT /excel/code-system-export.
 */
export class GenerateCodeSystemExportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeSystemExportRowDto)
  rows: CodeSystemExportRowDto[];
}

