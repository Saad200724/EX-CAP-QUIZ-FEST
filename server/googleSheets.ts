import { google } from 'googleapis';
import type { Registration } from '@shared/schema';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
}

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor(config: GoogleSheetsConfig) {
    const auth = new google.auth.GoogleAuth({
      credentials: config.credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = config.spreadsheetId;
  }

  async addRegistration(registration: Registration): Promise<void> {
    try {
      // Prepare the data row for the spreadsheet
      const values = [
        [
          new Date().toISOString(), // Timestamp
          registration.nameEnglish,
          registration.nameBangla,
          registration.fatherName,
          registration.motherName,
          registration.studentId,
          registration.class,
          registration.section,
          registration.bloodGroup,
          registration.phoneWhatsapp,
          registration.email || '',
          registration.presentAddress,
          registration.permanentAddress,
          registration.classCategory,
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:N', // Adjust range as needed
        valueInputOption: 'USER_ENTERED',
        resource: {
          values,
        },
      });

      console.log('✅ Registration data sent to Google Sheets successfully');
    } catch (error) {
      console.error('❌ Failed to send data to Google Sheets:', error);
      throw error;
    }
  }

  async createHeaders(): Promise<void> {
    try {
      const headers = [
        [
          'Timestamp',
          'Name (English)',
          'Name (Bangla)',
          "Father's Name",
          "Mother's Name",
          'Student ID',
          'Class',
          'Section',
          'Blood Group',
          'Phone (WhatsApp)',
          'Email',
          'Present Address',
          'Permanent Address',
          'Class Category'
        ]
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A1:N1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: headers,
        },
      });

      console.log('✅ Headers created in Google Sheets');
    } catch (error) {
      console.error('❌ Failed to create headers:', error);
      throw error;
    }
  }
}

// Factory function to create GoogleSheetsService instance
export function createGoogleSheetsService(): GoogleSheetsService | null {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      console.warn('⚠️ Google Sheets credentials not configured - skipping sheet integration');
      return null;
    }

    return new GoogleSheetsService({
      spreadsheetId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'), // Handle newlines in private key
      },
    });
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets service:', error);
    return null;
  }
}