interface IRawShow {
    ShowID: number;
    NumberOfPeople: number;
    ProgramID: number;
    Price: number;
    Notes: string;
    CustomerID: number;
    DatePerformance:  Date;
  }
  
 interface IShowDTO {
    showID: number;
    numberOfPeople: number;
    programID: number;
    price: number;
    notes: string;
    customerID: number;
    datePerformance: string;
  }
  

  interface IRawShowPostgress {
    showid: number;
    numberofpeople: number;
    programid: number;
    price: number;
    notes: string;
    customerid: number;
    dateperformance:  Date;
  }

