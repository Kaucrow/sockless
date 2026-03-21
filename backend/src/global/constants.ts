import fs from 'fs';
import toml from 'toml';
import yaml from 'yaml';
import multer from 'multer';
import path from 'path';

import { configSchema } from '@schemas/config.js';
import { menuConfigSchema } from '@schemas/menus.js';
import { queriesSchema } from '@schemas/queries.js';

export const config = configSchema.parse(
  toml.parse(
    fs.readFileSync('./src/config/config.toml', 'utf-8')
  )
);

export const server = config.server;

export const frontend = {
  host: config.frontend.host,
  port: config.frontend.port,
  url: `http://${config.frontend.host}:${config.frontend.port}`
};

export const session = config.session;

export const database = {
  host: config.database.host,
  port: config.database.port,
  name: config.database.name,
  user: config.database.user,
  pass: config.database.pass,
  url: ''
};

export const mailer = {
  service: config.mailer.service,
  host: config.mailer.host,
  port: config.mailer.port,
  secure: config.mailer.secure,
  auth: {
    user: config.mailer.user,
    pass: config.mailer.pass
  }
};

export const maintenance = {
  adminProfile: config.maintenance.adminProfile
};

export const queries = queriesSchema.parse(
  yaml.parse(fs.readFileSync('./src/config/queries.yaml', 'utf-8'))
);

export const menus = menuConfigSchema.parse(
  JSON.parse(fs.readFileSync('./src/config/menus.json', 'utf-8'))
);

export const upload = multer({ storage: multer.memoryStorage() });

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');