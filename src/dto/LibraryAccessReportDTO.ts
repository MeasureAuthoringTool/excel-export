interface SharedWithUser {
  userId: string;
  dateShared: string;
}

export interface LibraryAccessReportDTO {
  id: string;
  libraryName: string;
  libraryModel: string;
  owner: string;
  sharedWith: Array<SharedWithUser>;
}
