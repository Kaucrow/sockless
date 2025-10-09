import { Pool } from 'pg';
import { database } from '@const/constants.js';

export const UNIQUE_VIOLATION_CODE = '23505';

export const dbPool = await new Pool({
  host: database.host,
  port: database.port,
  database: database.name,
  user: database.user,
  password: database.password
}).connect();