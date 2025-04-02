

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
  export default getConfigValue;