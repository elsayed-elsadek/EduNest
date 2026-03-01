export type ContentType = 'lecture' | 'quiz' | 'assignment' | 'session' | 'project';

export interface ContentItem {
  type: ContentType;
  title: string;
  id?: number | string;
  isDraft?: boolean;
}

export interface ModuleState {
  id: number | null;
  title: string;
  items: ContentItem[];
  expanded: boolean;
}
