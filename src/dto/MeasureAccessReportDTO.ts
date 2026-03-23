interface SharedWithUser {
  userId: string;
  dateShared: string;
}

export interface MeasureAccessReportDTO {
  id: string;
  measureName: string;
  measureModel: string;
  cmsId: string;
  owner: string;
  sharedWith: Array<SharedWithUser>;
}
