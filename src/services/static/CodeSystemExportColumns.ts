import { CodeSystemExportRowDto } from '../../dto/GenerateCodeSystemExportDto';

/**
 * A single group header (Row 1) definition. Groups span a contiguous, 1-based
 * inclusive range of columns and share a fill color.
 */
export interface CodeSystemExportGroup {
  label: string;
  /** 1-based inclusive start column. */
  start: number;
  /** 1-based inclusive end column. */
  end: number;
  /** ARGB (no leading '#') fill color. */
  fill: string;
}

/**
 * A single column (Row 2) definition. `header` is the display label and `field`
 * is the corresponding key on {@link CodeSystemExportRowDto}.
 */
export interface CodeSystemExportColumn {
  header: string;
  field: keyof CodeSystemExportRowDto;
}

/**
 * SINGLE SOURCE OF TRUTH for the Code System Export sheet columns.
 *
 * The order of this array drives BOTH the header row (Row 2) and the
 * row-writing loop. Keep it in sync with {@link CodeSystemExportRowDto}.
 *
 * NOTE: The "VSAC Version" column is intentionally retained here so this same
 * template can back a future report that highlights code systems missing a
 * VSAC version.
 */
export const CODE_SYSTEM_EXPORT_COLUMNS: CodeSystemExportColumn[] = [
  // Code System (1–4)
  { header: 'Title', field: 'title' },
  { header: 'Name', field: 'name' },
  { header: 'OID', field: 'oid' },
  { header: 'Full URL', field: 'fullUrl' },
  // Version (5–8)
  { header: 'FHIR Version', field: 'fhirVersion' },
  { header: 'VSAC Version', field: 'vsacVersion' },
  { header: 'Version ID', field: 'versionId' },
  { header: 'Is Latest Version', field: 'latestVersion' },
  // Record Details (9–11)
  { header: 'Last Updated', field: 'lastUpdated' },
  { header: 'Last Updated (Upstream)', field: 'lastUpdatedUpstream' },
  { header: 'ID', field: 'id' },
];

/**
 * SINGLE SOURCE OF TRUTH for the Row 1 merged group headers. Column ranges are
 * 1-based inclusive and together span all columns.
 */
export const CODE_SYSTEM_EXPORT_GROUPS: CodeSystemExportGroup[] = [
  { label: 'Code System', start: 1, end: 4, fill: '1F3864' },
  { label: 'Version', start: 5, end: 8, fill: '375623' },
  { label: 'Record Details', start: 9, end: 11, fill: '843C39' },
];

export const CODE_SYSTEM_EXPORT_SHEET_NAME = 'Code Systems';
export const CODE_SYSTEM_EXPORT_DEFAULT_FILENAME = 'CodeSystemExport.xlsx';

export const CODE_SYSTEM_EXPORT_COLUMN_HEADER_FILL = 'FF63a1e0';

