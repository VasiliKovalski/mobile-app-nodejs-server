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


  export const appSettings = {
  KidsDateSpecified: "generalKidsReply.txt",
  KidsGeneral: "NoCertainDates.txt",
  KidsDateSpecifiedTravelFeeSpecified: "GeneralKidsReplyWithTravelFee.txt",
  KidsGeneralTravelFeeSpecified: "NoCertainDatesWithTravelFee.txt",

  AdultsNoFeesCertainDate: "AdultsNoFeesCertainDate.txt",
  AdultsNoFeesNoDate: "AdultsNoFeesNoDate.txt",
  AdultsTravelFeeCertainDate: "AdultsTravelFeeCertainDate.txt",
  AdultsTravelFeeNoDate: "AdultsTravelFeeNoDate.txt",

  SchoolGeneral: "SchoolGeneralReply.txt",
  Declined: "declineTemplate.txt"
};