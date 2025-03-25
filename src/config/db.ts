import sql from 'mssql'

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

export const poolPromise = new sql.ConnectionPool(config_sql)
  .connect()
  .then((pool: any) => {
    console.log("✅ Connected to MS SQL Server");
    return pool;
  })
  .catch((err: any) => {
    console.error("❌ Database connection failed:", err);
  });


  
  
  

  