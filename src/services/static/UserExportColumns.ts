import {
  GenerateUserExportDto,
  UserExportRowDto,
} from '../../dto/GenerateUserExportDto';

export type UserExportSelectableGroupKey =
  | 'ownedMeasures'
  | 'sharedMeasures'
  | 'ownedLibraries'
  | 'sharedLibraries';

export type UserExportGroupKey =
  | 'userMetadata'
  | UserExportSelectableGroupKey;

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

export interface ResolvedUserExportGroup extends UserExportGroup {
  key: UserExportGroupKey;
}

/**
 * A single column (Row 2) definition. `header` is the display label and `field`
 * is the corresponding key on {@link UserExportRowDto}.
 */
export interface UserExportColumn {
  header: string;
  field: keyof UserExportRowDto;
}

interface UserExportGroupDefinition {
  key: UserExportGroupKey;
  label: string;
  fill: string;
  columns: UserExportColumn[];
}

export const USER_EXPORT_OPTION_KEYS: UserExportSelectableGroupKey[] = [
  'ownedMeasures',
  'sharedMeasures',
  'ownedLibraries',
  'sharedLibraries',
];

const USER_EXPORT_GROUP_DEFINITIONS: UserExportGroupDefinition[] = [
  {
    key: 'userMetadata',
    label: 'User Metadata',
    fill: '1F3864',
    columns: [
      { header: 'User Display Name', field: 'userDisplayName' },
      { header: 'First Name', field: 'firstName' },
      { header: 'Last Name', field: 'lastName' },
      { header: 'HARP ID', field: 'harpId' },
      { header: 'Email Address', field: 'emailAddress' },
      { header: 'User Status', field: 'userStatus' },
      { header: 'Roles', field: 'roles' },
      { header: 'Approval (UTC)', field: 'approval' },
      { header: 'Last Login (UTC)', field: 'lastLogin' },
    ],
  },
  {
    key: 'ownedMeasures',
    label: "User's Owned Measures",
    fill: '375623',
    columns: [
      { header: 'Owned Measure Name', field: 'ownedMeasureName' },
      { header: 'Owned Measure Version', field: 'ownedMeasureVersion' },
      { header: 'Owned Measure Status', field: 'ownedMeasureStatus' },
      { header: 'Owned Measure Model', field: 'ownedMeasureModel' },
      { header: 'Owned Measure CMS ID', field: 'ownedMeasureCmsId' },
      { header: 'Owned Measure Updated (UTC)', field: 'ownedMeasureUpdated' },
    ],
  },
  {
    key: 'sharedMeasures',
    label: 'Measures Shared with User',
    fill: '843C39',
    columns: [
      { header: 'Shared Measure Name', field: 'sharedMeasureName' },
      { header: 'Shared Measure Version', field: 'sharedMeasureVersion' },
      { header: 'Shared Measure Status', field: 'sharedMeasureStatus' },
      { header: 'Shared Measure Model', field: 'sharedMeasureModel' },
      { header: 'Shared Measure CMS ID', field: 'sharedMeasureCmsId' },
      { header: 'Shared Measure Owner', field: 'sharedMeasureOwner' },
      { header: 'Shared Measure Updated (UTC)', field: 'sharedMeasureUpdated' },
    ],
  },
  {
    key: 'ownedLibraries',
    label: "User's Owned Libraries",
    fill: '5B2C6F',
    columns: [
      { header: 'Owned Library Name', field: 'ownedLibraryName' },
      { header: 'Owned Library Version', field: 'ownedLibraryVersion' },
      { header: 'Owned Library Status', field: 'ownedLibraryStatus' },
      { header: 'Owned Library Model', field: 'ownedLibraryModel' },
      { header: 'Owned Library Updated (UTC)', field: 'ownedLibraryUpdated' },
    ],
  },
  {
    key: 'sharedLibraries',
    label: 'Libraries Shared with User',
    fill: '404040',
    columns: [
      { header: 'Shared Library Name', field: 'sharedLibraryName' },
      { header: 'Shared Library Version', field: 'sharedLibraryVersion' },
      { header: 'Shared Library Status', field: 'sharedLibraryStatus' },
      { header: 'Shared Library Model', field: 'sharedLibraryModel' },
      { header: 'Shared Library Owner', field: 'sharedLibraryOwner' },
      { header: 'Shared Library Updated (UTC)', field: 'sharedLibraryUpdated' },
    ],
  },
];

function toResolvedGroups(
  definitions: UserExportGroupDefinition[],
): ResolvedUserExportGroup[] {
  let nextStart = 1;
  return definitions.map((definition) => {
    const start = nextStart;
    const end = start + definition.columns.length - 1;
    nextStart = end + 1;
    return {
      key: definition.key,
      label: definition.label,
      start,
      end,
      fill: definition.fill,
    };
  });
}

function hasExplicitSelectableOptions(
  options?: Pick<
    GenerateUserExportDto,
    'ownedMeasures' | 'sharedMeasures' | 'ownedLibraries' | 'sharedLibraries'
  >,
): boolean {
  return USER_EXPORT_OPTION_KEYS.some((key) => options?.[key] !== undefined);
}

/**
 * SINGLE SOURCE OF TRUTH for the Full User Export sheet columns.
 *
 * The order of this array drives the default/full-export header row and data
 * row-writing loop. Keep it in sync with {@link UserExportRowDto}.
 */
export const USER_EXPORT_COLUMNS: UserExportColumn[] =
  USER_EXPORT_GROUP_DEFINITIONS.flatMap((group) => group.columns);

/**
 * SINGLE SOURCE OF TRUTH for the default/full-export Row 1 merged group
 * headers. Column ranges are 1-based inclusive and together span all columns.
 */
export const USER_EXPORT_GROUPS: UserExportGroup[] = toResolvedGroups(
  USER_EXPORT_GROUP_DEFINITIONS,
);

export function resolveUserExportLayout(
  options?: Pick<
    GenerateUserExportDto,
    'ownedMeasures' | 'sharedMeasures' | 'ownedLibraries' | 'sharedLibraries'
  >,
): {
  columns: UserExportColumn[];
  groups: ResolvedUserExportGroup[];
} {
  const explicitSelectableOptions = hasExplicitSelectableOptions(options);
  const includedDefinitions = USER_EXPORT_GROUP_DEFINITIONS.filter((definition) => {
    if (definition.key === 'userMetadata') {
      return true;
    }

    return !explicitSelectableOptions || options?.[definition.key] === true;
  });

  return {
    columns: includedDefinitions.flatMap((definition) => definition.columns),
    groups: toResolvedGroups(includedDefinitions),
  };
}

export const USER_EXPORT_SHEET_NAME = 'User Export';
export const USER_EXPORT_DEFAULT_FILENAME = 'UserExport.xlsx';

export const USER_EXPORT_COLUMN_HEADER_FILL = 'FF63a1e0';

export const USER_EXPORT_OWNED_MEASURE_FILL = 'FFD9EAD3';
export const USER_EXPORT_SHARED_MEASURE_FILL = 'FFFCE5CD';
export const USER_EXPORT_OWNED_LIBRARY_FILL = 'FFEADCF8';
export const USER_EXPORT_SHARED_LIBRARY_FILL = 'FFF7F7F7';
