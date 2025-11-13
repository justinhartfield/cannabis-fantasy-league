/**
 * Schema validation utilities
 * Validates that database schema matches expected structure before operations
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: string;
}

/**
 * Check if a column exists in a table
 * Note: PostgreSQL stores unquoted identifiers in lowercase, but quoted identifiers preserve case
 * Since our table uses quoted identifiers ("cannabisStrains"), we need to check both cases
 */
async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Check both the exact case and lowercase (PostgreSQL normalizes unquoted identifiers)
  const result = await db.execute<ColumnInfo>(sql`
    SELECT column_name as "columnName", data_type as "dataType", is_nullable as "isNullable"
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (table_name = ${tableName} OR LOWER(table_name) = LOWER(${tableName}))
      AND (column_name = ${columnName} OR LOWER(column_name) = LOWER(${columnName}))
  `);

  return result.length > 0;
}

/**
 * Get all columns for a table
 */
async function getTableColumns(tableName: string): Promise<ColumnInfo[]> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Check both exact case and lowercase for table name matching
  const result = await db.execute<ColumnInfo>(sql`
    SELECT column_name as "columnName", data_type as "dataType", is_nullable as "isNullable"
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (table_name = ${tableName} OR LOWER(table_name) = LOWER(${tableName}))
    ORDER BY ordinal_position
  `);

  return result;
}

/**
 * Validate that the cannabisStrains table has all required columns
 * Throws an error with actionable message if validation fails
 */
export async function validateCannabisStrainsSchema(): Promise<void> {
  const requiredColumns = [
    'id',
    'metabaseId',
    'name',
    'slug',
    'type',
    'description',
    'effects',
    'flavors',
    'terpenes',
    'thcMin',
    'thcMax',
    'cbdMin',
    'cbdMax',
    'pharmaceuticalProductCount',
    'createdAt',
    'updatedAt',
  ];

  const tableName = 'cannabisStrains';
  const missingColumns: string[] = [];

  for (const columnName of requiredColumns) {
    const exists = await columnExists(tableName, columnName);
    if (!exists) {
      missingColumns.push(columnName);
    }
  }

  if (missingColumns.length > 0) {
    const columnsList = missingColumns.map(col => `"${col}"`).join(', ');
    throw new Error(
      `Schema validation failed: The following columns are missing from the "${tableName}" table: ${columnsList}. ` +
      `Please run the database migration: npm run db:migrate`
    );
  }
}

/**
 * Validate that a table exists
 */
export async function validateTableExists(tableName: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Check both exact case and lowercase for table name matching
  const result = await db.execute<{ tableName: string }>(sql`
    SELECT table_name as "tableName"
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND (table_name = ${tableName} OR LOWER(table_name) = LOWER(${tableName}))
  `);

  if (result.length === 0) {
    throw new Error(`Table "${tableName}" does not exist in the database`);
  }
}

/**
 * Get schema information for debugging
 */
export async function getTableSchemaInfo(tableName: string): Promise<{
  exists: boolean;
  columns: ColumnInfo[];
}> {
  try {
    const columns = await getTableColumns(tableName);
    return {
      exists: true,
      columns,
    };
  } catch (error) {
    return {
      exists: false,
      columns: [],
    };
  }
}

