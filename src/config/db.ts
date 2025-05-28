import sql from 'mssql'
import { Pool } from 'pg';


import config from 'dotenv'
config.config();// Load environment variables from .env


const config_sql =  {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.HOST as string, // Use remote server IP or domain
  database: process.env.DATABASE,
  options: {

    trustServerCertificate: true, // If using a self-signed cert
    
  },
};


const config_sql_PostGreSQL = {
  connectionString: process.env.POSTGRES_DATABASE_URL, // or set properties manually
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
};

export const poolPromise = new sql.ConnectionPool(config_sql)
  .connect()
  .then((pool: any) => {
    console.log("✅ Connected to MS SQL Server");
    return pool;
  })
  .catch((err: any) => {
    console.error("❌ Database Interserver connection failed:", err);
  });


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



  
  
  

  