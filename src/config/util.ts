import { IWebApiPrivateEmail, RequestTypeEnum } from '../interfaces/IWebApiPrivateEmail.js';
import { poolPromise } from '../config/db.js';
import fs from "fs";

 async function getConfigValue(key: string): Promise<string> {
    try {
      const response = await fetch('./config.json'); // Ensure correct path to the JSON file
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.statusText}`);
      }
  
      const config = await response.json();
      
      if (key in config) {
        return config[key];
      } else {
        throw new Error(`Key "${key}" does not exist in the configuration.`);
      }
    } catch (error) {
      console.log('ERROR');
      throw error;
    }
  }

  export function getTimeDifference(): number {
    const nzZoneName = "Pacific/Auckland"; // Equivalent to "New Zealand Standard Time"
    
    const nowUtc = new Date(); // Current UTC time
    const nzTime = new Date(nowUtc.toLocaleString("en-US", { timeZone: nzZoneName })); // Convert to NZ time
    
    const timeDifference = (nowUtc.getTime() - nzTime.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
    
    return Math.abs(Math.round(timeDifference)); // Return absolute integer value
}

export function formatDateIgnoringUTC(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  
    //return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  export function extractRefNumberFrom(invoiceFileName: string): string {
    const charsFromEnd = 12; // Number of characters from the end
    const charsToExtract = 8; // Number of characters to extract

    // Calculate the starting index
    const startIndex = invoiceFileName.length - charsFromEnd;

    // Check if the starting index is non-negative
    if (startIndex >= 0) {
        // Extract the substring
        return invoiceFileName.substring(startIndex, startIndex + charsToExtract);
    } else {
        return "";
    }
}


export async function loadEmailTemplates(): Promise<Record<string, string>> {
  try {
      const pool = await poolPromise;
      if (!pool) throw new Error("Database connection failed.");

      const result = await pool.request().query("SELECT [key_request], [BODY] FROM EmailTemplates where isActive = 1");

      const emailTemplates = result.recordset.reduce((acc:any, row:any) => {
          acc[row.key_request] = row.BODY;
          return acc;
      }, {} as Record<string, string>);

      console.log("✅ Email templates loaded successfully.");
      return emailTemplates;
  } catch (error) {
      console.error("❌ Error loading email templates:", error);
      return {}; // Return an empty object if there's an error
  }
}
export function getTemplateFileName(emailData: IWebApiPrivateEmail, emailTemplates: Record<string, string>): string {
  if (emailData.decline) return emailTemplates["Declined"] || "";
  
  if (emailData.requestType === RequestTypeEnum.Kids) {
    
      if (emailData.isAskingCertainDate) {
          return emailData.isAskingTravelFee
              ? emailTemplates["KidsDateSpecifiedTravelFeeSpecified"] || ""
              : emailTemplates["KidsDateSpecified"] || "";
      } else {
          return emailData.isAskingTravelFee
              ? emailTemplates["KidsGeneralTravelFeeSpecified"] || ""
              : emailTemplates["KidsGeneral"] || "";
      }
  }

  if (emailData.requestType === RequestTypeEnum.Adults) {
      if (emailData.isAskingCertainDate) {
          return emailData.isAskingTravelFee
              ? emailTemplates["AdultsTravelFeeCertainDate"] || ""
              : emailTemplates["AdultsNoFeesCertainDate"] || "";
      } else {
          return emailData.isAskingTravelFee
              ? emailTemplates["AdultsTravelFeeNoDate"] || ""
              : emailTemplates["AdultsNoFeesNoDate"] || "";
      }
  }

  if (emailData.requestType === RequestTypeEnum.School) {
      return emailTemplates["SchoolGeneral"] || "";
  }

  return "";
}

export function getReceiverName(receiverName: string, splitName: boolean, ignoreName: boolean = false): string {
  if (ignoreName) return ",";

  if (splitName) {
    const names = receiverName.trim().split(" ");
    return names.length > 1 ? names[0] + "," : receiverName + ",";
  }

  return receiverName + ",";
}  

export const readFile_ = () => 
{
  const rawData = fs.readFileSync("vasya.json", "utf8");

  // Parse JSON data
  const jsonData = JSON.parse(rawData);
  
  console.log(jsonData);

}

export function removeNewlines(str: string): string {
  return str.replace(/\n/g, ""); // Removes all \n characters
}

export function isNullOrEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}
export default getConfigValue;