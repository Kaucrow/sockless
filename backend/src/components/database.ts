import {
  Pool as PgPool,
  type PoolClient as PgPoolClient
} from 'pg';
import mysql, {
  type RowDataPacket,
  type Pool as MySQLPool
} from 'mysql2/promise';
import { z } from 'zod';
import { database as dbConfig } from '@const/constants.js';
import type { ZodType } from "zod";

const PG_UNIQUE_VIOLATION = '23505';
const MYSQL_DUPLICATE_ENTRY = 1062;

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ConflictError extends DatabaseError {
  constructor(message: string, public detail?: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class SchemaValidationError extends DatabaseError {
  constructor(message: string, public rawData?: any) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

class DatabaseComponent {
  static #instance: DatabaseComponent;
  
  private type: 'postgresql' | 'mysql' | undefined = undefined;
  private dbPool: PgPoolClient | MySQLPool | undefined = undefined;

  private constructor() {}

  public static get instance(): DatabaseComponent {
    if (!DatabaseComponent.#instance) {
      DatabaseComponent.#instance = new DatabaseComponent();
    }
    return DatabaseComponent.#instance;
  }

  public async connect(type: 'postgresql' | 'mysql') {
    this.type = type;

    switch (type) {
      case 'postgresql': {
        this.dbPool = await new PgPool({
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.name,
          user: dbConfig.user,
          password: dbConfig.password
        }).connect();
        break;
      }
      case 'mysql': {
        this.dbPool = mysql.createPool({
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.name,
          user: dbConfig.user,
          password: dbConfig.password
        });
      }
    }
  }

  public async fetchOne<T>(sql: string, schema: ZodType<T>, args?: any[]): Promise<T | null> {
    if (!this.dbPool || !this.type) throw new Error("Database connection has not been initialized. Call db.connect() first.");

    const dbPool = this.dbPool;
    let row: unknown;

    switch (this.type) {
      case 'postgresql': {
        const result = await (dbPool as PgPoolClient).query(sql, args);

        // Get the first row
        row = result.rows[0];
        break;
      }
      case 'mysql': {
        const [rows] = await (dbPool as MySQLPool).query<RowDataPacket[]>(sql, args);

        // Get the first row
        row = rows[0];
        break;
      }
    }

    if (!row) return null;

    try {
      return schema.parse(row);
    } catch (err) {
      throw new SchemaValidationError("Database record failed app schema validation.", row);
    }
  }

  public async fetch<T>(sql: string, schema: ZodType<T>, args?: any[]): Promise<T[]> {
    if (!this.dbPool || !this.type) throw new Error("Database connection has not been initialized. Call db.connect() first.");

    const dbPool = this.dbPool;
    let rows: unknown[];

    switch (this.type) {
      case 'postgresql': {
        const result = await (dbPool as PgPoolClient).query(sql, args);

        // Get all rows
        rows = result.rows;
        break;
      }
      case 'mysql': {
        const [rawRows] = await (dbPool as MySQLPool).query<RowDataPacket[]>(sql, args);

        // Get all rows
        rows = rawRows;
        break;
      }
    }

    try {
      // Validate the entire array of rows
      return z.array(schema).parse(rows);
    } catch (err) {
      throw new SchemaValidationError("Database records failed app schema validation.", rows);
    }
  }

  public async execute(sql: string, args?: any[]): Promise<number | null> {
    if (!this.dbPool || !this.type) throw new Error("Database connection has not been initialized. Call db.connect() first.");

    const dbPool = this.dbPool;
    let rowCount: number | null;

    try {
      switch (this.type) {
        case 'postgresql': {
          const result = await (dbPool as PgPoolClient).query(sql, args);

          rowCount = result.rowCount;
          break;
        }
        case 'mysql': {
          const [result] = await (dbPool as MySQLPool).query(sql, args);

          rowCount = (result as mysql.ResultSetHeader).affectedRows;
          break;
        }
      }
    } catch (err: any) {
      // Handle conflict database errors
      if (err.code === PG_UNIQUE_VIOLATION || err.errno === MYSQL_DUPLICATE_ENTRY) {
        throw new ConflictError("A record with this unique value already exists.", err.detail);
      }
      // Re-throw other database errors
      throw err;
    }

    return rowCount;
  }
}

export const db = DatabaseComponent.instance;