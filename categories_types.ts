/**
 * TypeScript definitions for Wantok Workforce Category Data
 * Preserves localized context for Papua New Guinea (PNG).
 */

export enum CategoryID {
  ELECTRIC = "electric",
  PLUMBING = "plumbing",
  CARPENTRY = "carpentry",
  FINANCE = "finance",
  LEGAL = "legal",
  MEDICAL = "medical",
  DESIGN = "design",
  MORE = "more",
}

export interface SubCategory {
  name: string;
  description: string;
}

export interface Category {
  id: CategoryID;
  label: string;
  icon: string;
  color: string;
  subcategories: SubCategory[];
}

export const CATEGORY_DATA: Category[] = [];
