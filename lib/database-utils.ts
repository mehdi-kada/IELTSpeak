import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { handleDatabaseError, AppError } from "@/lib/error-handling";

/**
 * Centralized database utilities for common operations
 * Provides consistent error handling and logging
 */

export interface DatabaseQueryOptions {
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

/**
 * Generic function to fetch data from a table with error handling
 */
export async function fetchFromTable<T>(
  tableName: string,
  options: DatabaseQueryOptions = {}
): Promise<T | T[] | null> {
  try {
    const supabase = await createClient();
    let query = supabase.from(tableName);

    // Apply select
    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    // Execute query
    const { data, error } = options.single 
      ? await query.single()
      : await query;

    if (error) {
      throw handleDatabaseError(error, `fetch from ${tableName}`);
    }

    logger.debug(`Successfully fetched data from ${tableName}`, {
      table: tableName,
      recordCount: Array.isArray(data) ? data.length : 1,
    });

    return data as T | T[];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Failed to fetch from ${tableName}`, error);
    throw new AppError(`Database query failed for table: ${tableName}`, 500);
  }
}

/**
 * Generic function to insert data into a table
 */
export async function insertIntoTable<T>(
  tableName: string,
  data: Record<string, any>,
  returnColumns?: string
): Promise<T | null> {
  try {
    const supabase = await createClient();
    
    const query = supabase
      .from(tableName)
      .insert(data);

    const { data: insertedData, error } = returnColumns
      ? await query.select(returnColumns).single()
      : await query;

    if (error) {
      throw handleDatabaseError(error, `insert into ${tableName}`);
    }

    logger.info(`Successfully inserted data into ${tableName}`, {
      table: tableName,
    });

    return insertedData as T;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Failed to insert into ${tableName}`, error);
    throw new AppError(`Database insert failed for table: ${tableName}`, 500);
  }
}

/**
 * Generic function to update data in a table
 */
export async function updateInTable<T>(
  tableName: string,
  data: Record<string, any>,
  filters: Record<string, any>,
  returnColumns?: string
): Promise<T | null> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from(tableName)
      .update(data);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: updatedData, error } = returnColumns
      ? await query.select(returnColumns).single()
      : await query;

    if (error) {
      throw handleDatabaseError(error, `update in ${tableName}`);
    }

    logger.info(`Successfully updated data in ${tableName}`, {
      table: tableName,
      filters,
    });

    return updatedData as T;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Failed to update in ${tableName}`, error);
    throw new AppError(`Database update failed for table: ${tableName}`, 500);
  }
}

/**
 * Get current authenticated user with error handling
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw handleDatabaseError(error, "get current user");
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error("Failed to get current user", error);
    throw new AppError("Authentication check failed", 500);
  }
}

/**
 * Check if user exists and is authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }
  
  return user;
}