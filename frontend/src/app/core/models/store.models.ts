export interface CategoryRecord {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentCategory?: string | null;
  level?: number;
  isActive?: boolean;
  children?: CategoryRecord[];
  _processing?: boolean;
}
