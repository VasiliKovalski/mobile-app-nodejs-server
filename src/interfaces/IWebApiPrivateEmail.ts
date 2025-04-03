export interface IWebApiPrivateEmail {
    requestType: RequestTypeEnum;
    travelFee: string,
    proposedDate:Date,
    isAskingTravelFee: boolean;
    subject: string,
    receiverName: string,
    emailAddress: string,
    isAskingCertainDate: boolean;
    decline: boolean;
  }
  
  export enum RequestTypeEnum {
    Kids = 1,
    Adults = 2,
    School = 3,
  }