interface WebApiCallNote {
    // Define the structure of WebApiCallNote here
    // Example:
    // noteId: number;
    // content: string;
  }
  
  export interface IWebApiCall {
    outbound?: boolean;
    cnCallID?: number;
    note?: string;
    callNoteID?: number;
    cnDateCreated?: Date;
  
    customerName?: string;
    callID?: number;
    dateCreated?: Date;
    callBackDateStr?: Date;
    shortNotes?: string;
    gps?: string;
    notes?: string;
    result?: number;
    customerID?: number;
    adminEmail?: string;
    callBackDate?: Date;
    administratorID?: number;
    hotelID?: number;
    confirmationStatus?: number;
    lastUpdated?: Date;
  
    _callNotes?: WebApiCallNote[];
  
    
  }