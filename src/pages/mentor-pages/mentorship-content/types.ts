export type ContentType = 'lecture' | 'quiz' | 'assignment' | 'session' | 'project';

export interface ContentItem {
  type: ContentType;
  title: string;
  id?: number | string;
  isDraft?: boolean;
  /** weekId is stored so we can build a globally-unique composite key: weekId-type-id */
  weekId?: number | string;
  lectureUrl?: string;
}

export interface ModuleState {
  id: number | string | null;
  title: string;
  items: ContentItem[];
  expanded: boolean;
}
