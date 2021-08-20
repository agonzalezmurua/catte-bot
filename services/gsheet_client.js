const Axios = require("axios");

const BASE_URL = "https://sheets.googleapis.com";
const spreadsheet = "1KQ8xCUF71Em3hFKk340mpD38Lmvs8rZhJC6E5nFC8NE";

const client = Axios.create({
  baseURL: BASE_URL,
  params: {
    key: process.env.GSHEET_KEY,
  },
});

const GsheetClient = {
  getQuestions: async () => {
    const keys = [];
    const questions = [];
    const {
      data: {
        sheets: [
          {
            data: [
              {
                rowData: [header, ...entries],
              },
            ],
          },
        ],
      },
    } = await client.get(`/v4/spreadsheets/${spreadsheet}`, {
      params: { includeGridData: true },
    });

    keys.push(...header.values.map(({ formattedValue }) => formattedValue));

    questions.push(
      ...entries.map((row) => {
        const entry = {};

        keys.forEach((_, index) => {
          const key = keys[index];
          const value = row.values[index].formattedValue;

          entry[key] = value;
        });

        return entry;
      })
    );

    return questions;
  },
};

module.exports = {
  GsheetClient: GsheetClient,
};
