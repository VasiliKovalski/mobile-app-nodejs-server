import { google } from "googleapis";
import fs from "fs";
import sql from 'mssql'
import { poolPromise } from '../config/db.js';
import { type Request, type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import { extractRefNumberFrom, formatDateIgnoringUTC, getReceiverName, getTemplateFileName, getTimeDifference, loadEmailTemplates, removeNewlines,  } from '../config/util.js';
import { IWebApiAccomodation } from '../interfaces/IWebApiAccomodation.js';
import  { GoogleAuth }  from "google-auth-library";
import  nodemailer  from 'nodemailer';
import { getRandomValues } from 'crypto';
import { IWebApiPrivateEmail } from '../interfaces/IWebApiPrivateEmail.js';

//----------------------------------------------------------------------------------------------------------------------------------------------------------
async function getCredentials(typeCustomerId: number): Promise<{ credential: IWebApiCredential | null; errMessage: string }> {
  let errMessage = "";

  try {
      const pool = await poolPromise;
      if (!pool) throw new Error("Database connection failed.");

      const result = await pool.request()
          .input("typeCustomerID", sql.Int, typeCustomerId)
          .query("SELECT * FROM Credential WHERE typeCustomerID = 2");

      const record = result.recordset[0];

      if (!record) {
          errMessage = "No credentials found for the given typeCustomerId.";
          return { credential: null, errMessage };
      }

      const credential: IWebApiCredential = {
          BankAccountNumber: record.BankAccountNumber,
          AddressLine1: record.AddressLine1,
          AddressLine2: record.AddressLine2,
          AddressLine3: record.AddressLine3,
          IsGSTRegistered: record.IsGSTRegistered,
          IRD_Number: record.IRD_Number,
          GSTNumber: record.GSTNumber,
          GSTRate: record.GSTRate,
          CompanyName: record.CompanyName,
          PhoneNumber: record.PhoneNumber,
          Mobile: record.Mobile,
          Email: record.Email,
          PersonName: record.PersonName,
          GoldShowPrice: record.GoldShowPrice,
          SilverShowPrice: record.SilverShowPrice,
          BronzeShowPrice: record.BronzeShowPrice,
          VIPShowPrice: record.VIPShowPrice,
          FullAdultPrice: record.FullAdultPackagePrice,
          HalfAdultPrice: record.partialAdultPackagePrice,
      };

      return { credential, errMessage };
  } catch (error) {
      console.error("❌ Error fetching credentials:", error);
      errMessage = "BUSINESS LAYER SQL FETCH ERROR, Method: getCredentials - " + error;
      return { credential: null, errMessage };
  }
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------
   export const GetCustomerRequestsLight = async (req: AuthRequest, res: Response) => {
   try {
        const pool = await poolPromise;
         if (!pool) {
           throw new Error("Database connection failed.");
         }
          
         // Query to fetch admins linked to the customer
         
         const query = `select CustomerRequestID, Name, Email, DateCreated, Comment, PhoneNumber, RequestType from CustomerRequest where customerStatusid = 1 `;
         
    const result = await pool.request()
    
    .query(query);
       const requestSrc: Record<string, any>[] = result.recordset;

       const finalResult = requestSrc.map(request => ({
        customerRequestID: request.CustomerRequestID,
        name : request.Name,
        email: request.Email,
        total: request.Total,
        comment:  request.Comment,
        requestType:  request.RequestType,
        phoneNumber:  request.PhoneNumber,
        dateCreated: request.DateCreated,
    }));

        res.json(finalResult)
       } catch (err) {
         console.error(`❌ Error fetching invoices`, err);
          res.status(500).json({ message: "Internal Server Error" });
       }
  }
//----------------------------------------------------------------------------------------------------------------------------------------------------------
  export const DeleteCustomerRequest = async (req: AuthRequest, res: Response) => {
    try {
         const pool = await poolPromise;
         const { customerRequestID } = req.query ;
         
          if (!pool) {
            throw new Error("Database connection failed.");
          }
           
      const query = `UPDATE dbo.CustomerRequest SET CustomerStatusID = 2 WHERE customerRequestID = @customerRequestID`;
     const result = await pool.request()
     .input("customerRequestID", sql.Int, customerRequestID) // Prevent SQL Injection
     .query(query);
 
     res.json();

        } catch (err) {
          console.error(`❌ Error fetching invoices`, err);
           res.status(500).json({ message: "Internal Server Error" });
        }
   }
   
   


//----------------------------------------------------------------------------------------------------------------------------------------------------------
   export const SendEmailToPrivateClient = async (req: AuthRequest, res: Response ) => {
 const privateEmailTrasnporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.VASKOVALSKI_EMAIL,
          pass: process.env.VASKOVALSKI_EMAIL_PASSWORD,  // Use an App Password, not your actual password
      }
  });  
    
  const educServiceTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.OFFICE_EMAIL, 
      serviceClient: process.env.GOOGLE_CLIENT_ID,
      privateKey: process.env.GOOGLE_PRIVATE_KEY,
    },
  });


       const { emailAddress, subject, receiverName, proposedDate, travelFee, requestType,  isAskingTravelFee, isAskingCertainDate, decline} = req.body;

       
       var credentials = await getCredentials(2);
       const emailTemplates = await loadEmailTemplates();

       const emailData: IWebApiPrivateEmail = {
        receiverName: receiverName,
        subject: subject,
        emailAddress: emailAddress,
        proposedDate: proposedDate,
        travelFee: travelFee,
        requestType: Number(requestType),  
        isAskingTravelFee: isAskingTravelFee,            // true or false
        isAskingCertainDate: isAskingCertainDate,         // true or false
        decline: decline                      // true or false
    };

      let emailBody = getTemplateFileName(emailData, emailTemplates);
       emailBody = emailBody.replace("<NAME_CUSTOMER>", getReceiverName(emailData.receiverName, true));
       emailBody = emailBody.replace("<PROPOSED_DATE>", emailData.proposedDate.toString());
       emailBody = emailBody.replace("<GOLD_SHOW_PRICE>", credentials.credential?.GoldShowPrice ?? "");
       emailBody = emailBody.replace("<SILVER_SHOW_PRICE>", credentials.credential?.SilverShowPrice ?? "");
       emailBody = emailBody.replace("<BRONZE_SHOW_PRICE>", credentials.credential?.BronzeShowPrice ?? "");
       emailBody = emailBody.replace("<VIP_SHOW_PRICE>", credentials.credential?.VIPShowPrice ?? "");
       emailBody = emailBody.replace("<FULL_ADULT_SHOW_PRICE>", credentials.credential?.FullAdultPrice ?? "");
       emailBody = emailBody.replace("<ONE_ADULT_ACT_ONLY_PRICE>", credentials.credential?.HalfAdultPrice ?? "");

       emailBody = emailBody.replace("<TRAVEL_FEE>", emailData.travelFee);
    
       let transporter = null;   
       let from_ = "";
       if (Number(requestType) === 3) // use office
       {
        transporter = educServiceTransporter;
        from_ = process.env.VASKOVALSKI + "<" + process.env.OFFICE_EMAIL+ ">";
     } 
       else {

         from_ = process.env.VASKOVALSKI + "<" + process.env.VASKOVALSKI_EMAIL+ ">";
         transporter = privateEmailTrasnporter;
 
       }
        

       try {
        const info = await transporter.sendMail({
            from: from_,
            to: emailAddress,
            subject: subject,
            html: emailBody,
        });

        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }

       res.json();
  
  }

 
  export default GetCustomerRequestsLight;