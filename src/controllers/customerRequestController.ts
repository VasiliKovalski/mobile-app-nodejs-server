
import {  poolPromisePostGreSQL,  } from '../config/db.js';
import { type Response } from "express";
import { type AuthRequest } from '../config/authMiddleware.js';
import { getGoogleBucket, getReceiverName,  getTemplateFileNameNEW,  loadAppSettings,  loadGoogleAuthSettings, readFileStorage,  } from '../config/util.js';
import nodemailer from 'nodemailer';
import { IWebApiPrivateEmail } from '../interfaces/IWebApiPrivateEmail.js';


//----------------------------------------------------------------------------------------------------------------------------------------------------------
async function getCredentials(typeCustomerId: number): Promise<{ credential: IWebApiCredential | null; errMessage: string }> {
  let errMessage = "";

  try {
    const pool = await poolPromisePostGreSQL;
    if (!pool) throw new Error("Database connection failed.");

    const typeCustomerId = 2;

    const result = await pool.query(`SELECT * FROM credential WHERE typecustomerid = $1`,
      [typeCustomerId]
    );
    const record = result.rows[0];

    if (!record) {
      errMessage = "No credentials found for the given typeCustomerId.";
      return { credential: null, errMessage };
    }

    const credential: IWebApiCredential = {
      bankaccountnumber: record.bankaccountnumber,
      addressline1: record.addressline1,
      addressline2: record.addressline2,
      addressline3: record.addressline3,
      isgstregistered: record.isgstregistered,
      ird_number: record.ird_number,
      gstnumber: record.gstnumber,
      gstrate: record.gstrate,
      companyname: record.companyname,
      phonenumber: record.phonenumber,
      mobile: record.mobile,
      email: record.email,
      personname: record.personname,
      goldshowprice: record.goldshowprice,
      silvershowprice: record.silvershowprice,
      bronzeshowprice: record.bronzeshowprice,
      vipshowprice: record.vipshowprice,
      fulladultprice: record.fulladultpackageprice,
      halfadultprice: record.partialadultpackageprice,
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




    const pool = await poolPromisePostGreSQL;
    if (!pool) {
      throw new Error("Database connection failed.");
    }

    // Query to fetch admins linked to the customer

    const query = `select CustomerRequestID, Name, Email, DateCreated, Comment, PhoneNumber, RequestType from CustomerRequest where customerStatusid = 1 `;

    //const result = await pool.
    const result = await pool.query(query);

    //.query(query);
    const requestSrc: Record<string, any>[] = result.rows;
    const finalResult = requestSrc.map(request => ({
      customerRequestID: request.customerrequestid,
      name: request.name,
      email: request.email,
      total: request.total,
      comment: request.comment,
      requestType: request.requesttype,
      phoneNumber: request.phonenumber,
      dateCreated: request.datecreated,
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
    const pool = await poolPromisePostGreSQL;
    const { customerRequestID } = req.query;

    if (!pool) {
      throw new Error("Database connection failed.");
    }

    const query = `
            UPDATE CustomerRequest 
              SET CustomerStatusID = 2 
              WHERE customerRequestID = $1
          `;

    const result = await pool.query(query, [customerRequestID]);

    res.json();

  } catch (err) {
    console.error(`❌ Error fetching invoices`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}




//----------------------------------------------------------------------------------------------------------------------------------------------------------
export const SendEmailToPrivateClient = async (req: AuthRequest, res: Response) => {

  const settings = await loadAppSettings('settings.json');

  const privateEmailTrasnporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: settings?.VASKOVALSKI_EMAIL,
      pass: settings?.VASKOVALSKI_EMAIL_PASSWORD,  // Use an App Password, not your actual password
    }
  });

  
  const { client_id, private_key } = await loadGoogleAuthSettings();


  const educServiceTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: settings?.OFFICE_EMAIL,
      serviceClient: client_id,
      privateKey: private_key,
    },
  });


  const { emailAddress, subject, receiverName, proposedDate, travelFee, requestType, isAskingTravelFee, isAskingCertainDate, decline } = req.body;


  var credentials = await getCredentials(2);

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

  let filename = getTemplateFileNameNEW(emailData);

  var bucket = await getGoogleBucket('customers-web-api-storage');


  let emailBody = await readFileStorage('PrivatePartyTemplates/', filename, bucket);
  //console.log(emailBody)

  emailBody = emailBody.replace("<NAME_CUSTOMER>", getReceiverName(emailData.receiverName, true));
  emailBody = emailBody.replace("<PROPOSED_DATE>", emailData.proposedDate.toString());
  emailBody = emailBody.replace("<GOLD_SHOW_PRICE>", credentials.credential?.goldshowprice ?? "");
  emailBody = emailBody.replace("<SILVER_SHOW_PRICE>", credentials.credential?.silvershowprice ?? "");
  emailBody = emailBody.replace("<BRONZE_SHOW_PRICE>", credentials.credential?.bronzeshowprice ?? "");
  emailBody = emailBody.replace("<VIP_SHOW_PRICE>", credentials.credential?.vipshowprice ?? "");
  emailBody = emailBody.replace("<FULL_ADULT_SHOW_PRICE>", credentials.credential?.fulladultprice ?? "");
  emailBody = emailBody.replace("<ONE_ADULT_ACT_ONLY_PRICE>", credentials.credential?.halfadultprice ?? "");

  emailBody = emailBody.replace("<TRAVEL_FEE>", emailData.travelFee);

  let transporter = null;
  let from_ = "";
  if (Number(requestType) === 3) // use office
  {
    transporter = educServiceTransporter;
    from_ = settings?.VASKOVALSKI + "<" + settings?.OFFICE_EMAIL + ">";
  }
  else {

    from_ = settings?.VASKOVALSKI + "<" + settings?.VASKOVALSKI_EMAIL + ">";
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