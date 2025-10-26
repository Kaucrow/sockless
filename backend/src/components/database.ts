import {
  Pool as PgPool,
  type PoolClient as PgPoolClient
} from 'pg';
import mysql, {
  type RowDataPacket,
  type Pool as MySQLPool
} from 'mysql2/promise';
import {
  DbError,
  DbConflictError,
  DbSchemaValidationError,
  DbNotNullViolationError
} from '@errors/index.js';
import { z } from 'zod';
import { objectToCamel, type ObjectToCamel } from 'ts-case-convert';
import { database as dbConfig } from '@const/constants.js';
import type { ZodType } from "zod";

const PG_UNIQUE_VIOLATION = '23505';
const PG_NOT_NULL_VIOLATION = '23502';
const MYSQL_DUPLICATE_ENTRY = 1062;
const MYSQL_BAD_NULL_ERROR = 1048;

class DatabaseComponent {
  static #instance: DatabaseComponent;

  private type: 'postgresql' | 'mysql' | undefined = undefined;
  private dbPool: PgPoolClient | MySQLPool | undefined = undefined;
  private transactionClient: PgPoolClient | MySQLPool | null = null;

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

  public async fetchOne<T extends object>(sql: string, schema: ZodType<T>, args?: any[]): Promise<ObjectToCamel<T> | null> {
    if (!this.dbPool || !this.type) throw new Error("Database connection has not been initialized. Call db.connect() first.");

    const dbPool = this.dbPool;
    let row: unknown;
    
    try {
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
    } catch (err: any) {
      // Handle NOT NULL database errors
      if (err.code === PG_NOT_NULL_VIOLATION || err.errno === MYSQL_BAD_NULL_ERROR) {
        throw new DbNotNullViolationError("Violation of NOT NULL constraint", err.detail);
      }
      // Handle other database errors
      throw new DbError(`Failed to fetch single row: ${err}`);
    }

    if (!row) return null;

    try {
      return objectToCamel(schema.parse(row));
    } catch (err) {
      throw new DbSchemaValidationError("Database record failed app schema validation.", row);
    }
  }

  public async fetch<T extends object>(sql: string, schema: ZodType<T>, args?: any[]): Promise<ObjectToCamel<T>[]> {
    if (!this.dbPool || !this.type) throw new Error("Database connection has not been initialized. Call db.connect() first.");

    const dbPool = this.dbPool;
    let rows: unknown[];

    try {
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
    } catch (err: any) {
      // Handle NOT NULL database errors
      if (err.code === PG_NOT_NULL_VIOLATION || err.errno === MYSQL_BAD_NULL_ERROR) {
        throw new DbNotNullViolationError("Violation of NOT NULL constraint", err.detail);
      }
      // Handle other database errors
      throw new DbError(`Failed to fetch rows: ${err}`);
    }

    try {
      // Validate the entire array of rows
      return objectToCamel(z.array(schema).parse(rows)) as ObjectToCamel<T>[];
    } catch (err) {
      throw new DbSchemaValidationError("Database records failed app schema validation.", rows);
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
      // Handle conflict & NOT NULL database errors
      if (err.code === PG_UNIQUE_VIOLATION || err.errno === MYSQL_DUPLICATE_ENTRY) {
        throw new DbConflictError("A record with this unique value already exists.", err.detail);
      } else if (err.code === PG_NOT_NULL_VIOLATION || err.errno === MYSQL_BAD_NULL_ERROR) {
        throw new DbNotNullViolationError("Violation of NOT NULL constraint", err.detail);
      }
      // Handle other database errors
      throw new DbError(`Failed to execute query: ${err}`);
    }

    return rowCount;
  }

  public async beginTransaction(): Promise<void> {
    if (!this.dbPool || !this.type) throw new Error("Database connection has not been initialized. Call db.connect() first.");

    if (this.transactionClient) throw new Error("Transaction already in progress.");

    try {
      switch (this.type) {
        case 'postgresql': {
          this.transactionClient = this.dbPool as PgPoolClient;
          this.transactionClient.query('BEGIN');
          break;
        }
        case 'mysql': {
          this.transactionClient = this.dbPool as MySQLPool;
          this.transactionClient.query('START TRANSACTION');
          break;
        }
      }
    } catch (err) {
      throw new DbError(`Failed to begin transaction: ${err}`);
    }
  }

  public async commit() {
    if (!this.dbPool || !this.type) throw new Error("Database connection has not been initialized. Call db.connect() first.");

    if (!this.transactionClient) throw new Error("No transaction in progress.");

    try {
      switch (this.type) {
        case 'postgresql': {
          await (this.transactionClient as PgPoolClient).query('COMMIT');
          break;
        }
        case 'mysql': {
          await (this.transactionClient as MySQLPool).query('COMMIT');
          break;
        }
      }
    } catch (err) {
      throw new DbError(`Failed to commit transaction: ${err}`);
    } finally {
      switch (this.type) {
        case 'postgresql': {
          (this.transactionClient as PgPoolClient).release();
          break;
        }
      }

      this.transactionClient = null;
    }
  }

  public async rollback() {
    if (!this.dbPool || !this.type) throw new Error("Database connection has not been initialized. Call db.connect() first.");

    if (!this.transactionClient) throw new Error("No transaction in progress.");

    try {
      switch (this.type) {
        case 'postgresql': {
          await (this.transactionClient as PgPoolClient).query('ROLLBACK');
          break;
        }
        case 'mysql': {
          await (this.transactionClient as MySQLPool).query('ROLLBACK');
        }
      }
    } catch (err) {
      throw new DbError(`Failed to rollback transaction: ${err}`);
    } finally {
      switch (this.type) {
        case 'postgresql': {
          (this.transactionClient as PgPoolClient).release();
          break;
        }
      }

      this.transactionClient = null;
    }
  }
}

export const db = DatabaseComponent.instance;