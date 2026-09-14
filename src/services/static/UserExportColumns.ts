import { UserExportRowDto } from '../../dto/GenerateUserExportDto';

/**
 * A single group header (Row 1) definition. Groups span a contiguous, 1-based
 * inclusive range of columns and share a fill color.
 */
export interface UserExportGroup {
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
 * is the corresponding key on {@link UserExportRowDto}.
 */
export interface UserExportColumn {
  header: string;
  field: keyof UserExportRowDto;
}

/**
 * SINGLE SOURCE OF TRUTH for the Full User Export sheet columns.
 *
 * The order of this array drives BOTH the header row (Row 2) and the
 * row-writing loop. Keep it in sync with {@link UserExportRowDto}.
 */
export const USER_EXPORT_COLUMNS: UserExportColumn[] = [
  // User Metadata (1–9)
  { header: 'User Display Name', field: 'userDisplayName' },
  { header: 'First Name', field: 'firstName' },
  { header: 'Last Name', field: 'lastName' },
  { header: 'HARP ID', field: 'harpId' },
  { header: 'Email Address', field: 'emailAddress' },
  { header: 'User Status', field: 'userStatus' },
  { header: 'Roles', field: 'roles' },
  { header: 'Approval', field: 'approval' },
  { header: 'Last Login', field: 'lastLogin' },
  // User's Owned Measures (10–15)
  { header: 'Owned Measure Name', field: 'ownedMeasureName' },
  { header: 'Owned Measure Version', field: 'ownedMeasureVersion' },
  { header: 'Owned Measure Status', field: 'ownedMeasureStatus' },
  { header: 'Owned Measure Model', field: 'ownedMeasureModel' },
  { header: 'Owned Measure CMS ID', field: 'ownedMeasureCmsId' },
  { header: 'Owned Measure Updated', field: 'ownedMeasureUpdated' },
  // Measures Shared with User (16–22)
  { header: 'Shared Measure Name', field: 'sharedMeasureName' },
  { header: 'Shared Measure Version', field: 'sharedMeasureVersion' },
  { header: 'Shared Measure Status', field: 'sharedMeasureStatus' },
  { header: 'Shared Measure Model', field: 'sharedMeasureModel' },
  { header: 'Shared Measure CMS ID', field: 'sharedMeasureCmsId' },
  { header: 'Shared Measure Owner', field: 'sharedMeasureOwner' },
  { header: 'Shared Measure Updated', field: 'sharedMeasureUpdated' },
  // User's Owned Libraries (23–27)
  { header: 'Owned Library Name', field: 'ownedLibraryName' },
  { header: 'Owned Library Version', field: 'ownedLibraryVersion' },
  { header: 'Owned Library Status', field: 'ownedLibraryStatus' },
  { header: 'Owned Library Model', field: 'ownedLibraryModel' },
  { header: 'Owned Library Updated', field: 'ownedLibraryUpdated' },
  // Libraries Shared with User (28–33)
  { header: 'Shared Library Name', field: 'sharedLibraryName' },
  { header: 'Shared Library Version', field: 'sharedLibraryVersion' },
  { header: 'Shared Library Status', field: 'sharedLibraryStatus' },
  { header: 'Shared Library Model', field: 'sharedLibraryModel' },
  { header: 'Shared Library Owner', field: 'sharedLibraryOwner' },
  { header: 'Shared Library Updated', field: 'sharedLibraryUpdated' },
];

/**
 * SINGLE SOURCE OF TRUTH for the Row 1 merged group headers. Column ranges are
 * 1-based inclusive and together span all 33 columns.
 */
export const USER_EXPORT_GROUPS: UserExportGroup[] = [
  { label: 'User Metadata', start: 1, end: 9, fill: '1F3864' },
  { label: "User's Owned Measures", start: 10, end: 15, fill: '375623' },
  { label: 'Measures Shared with User', start: 16, end: 22, fill: '843C39' },
  { label: "User's Owned Libraries", start: 23, end: 27, fill: '5B2C6F' },
  { label: 'Libraries Shared with User', start: 28, end: 33, fill: '404040' },
];

export const USER_EXPORT_SHEET_NAME = 'User Export';
export const USER_EXPORT_DEFAULT_FILENAME = 'UserExport.xlsx';

export const USER_EXPORT_COLUMN_HEADER_FILL = 'FF63a1e0';
