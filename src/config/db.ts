import sql from 'mssql'
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import * as path from 'path';
import {  Storage }  from '@google-cloud/storage';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import config from 'dotenv'

import { storage } from 'googleapis/build/src/apis/storage';
import { loadAppSettings } from './util.js';
config.config();// Load environment variables from .env


// const config_sql =  {
//   user: settings.SQL_USER,
//   password: settings.SQL_PASSWORD,
//   server: settings.HOST as string, // Use remote server IP or domain
//   database: settings.DATABASE,
//   options: {

//     trustServerCertificate: true, // If using a self-signed cert
    
//   },
// };






const settings = await loadAppSettings('settings.json');

console.log('settings?.POSTGRES_DATABASE_URL: ', settings?.POSTGRES_DATABASE_URL);

const config_sql_PostGreSQL = {
  connectionString: settings?.POSTGRES_DATABASE_URL, // or set properties manually
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
};

// export const poolPromise = new sql.ConnectionPool(config_sql)
//   .connect()
//   .then((pool: any) => {
//     console.log("✅ Connected to MS SQL Server");
//     return pool;
//   })
//   .catch((err: any) => {
//     console.error("❌ Database Interserver connection failed:", err);
//   });



export const poolPromise: Promise<sql.ConnectionPool | undefined> = Promise.resolve(undefined);

export const poolPromisePostGreSQL = new Pool(config_sql_PostGreSQL);

poolPromisePostGreSQL
  .connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL Server");
    client.release(); // Release client back to the pool
  })
  .catch(err => {
    console.error("❌ Database PostgreSQL connection failed:", err.stack);
  });



  
  
  

  