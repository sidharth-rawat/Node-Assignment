
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import Config from '../config/index.js';
import moment from 'moment';

const { FILE_UPLOAD_PATH,PUPPETEER_EXECUTABLE_PATH,NODE_ENV } = Config;

function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

const calculateSubTotal = (products) => {
  return products.reduce((acc, product) => acc + product.qty * product.rate, 0);
};

const calculateGST = (products) => {
  const subTotal = calculateSubTotal(products);
  return subTotal * 0.18; // Assuming GST is 18%
};

const calculateTotal = (products) => {
  const subTotal = calculateSubTotal(products);
  const gst = calculateGST(products);
  return subTotal + gst;
};

const generateHTMLTable = (products) => {
  let htmlContent = `
    <table class="table-details">
      <tr>
        <th class="table-details-head">#</th>
        <th class="table-details-head">Item & Description</th>
        <th class="table-details-head">Qty</th>
        <th class="table-details-head">Rate</th>
        <th class="table-details-head">Amount</th>
      </tr>`;

  products.forEach((product, index) => {
    const amount = product.qty * product.rate;
    htmlContent += `
      <tr>
        <td class="table-details-data">${index + 1}</td>
        <td class="table-details-data">${product.name}</td>
        <td class="table-details-data">${product.qty}</td>
        <td class="table-details-data">${product.rate}</td>
        <td class="table-details-data">${amount}</td>
      </tr>`;
  });

  htmlContent += `</table>`;
  return htmlContent;
};

export const generatePDF = async (products) => {
  // const browser = await puppeteer.launch({        executablePath: '/path/to/chrome',});
// const todayDate = new Date()
// const browser = await puppeteer.launch({ // Launch puppeteer browser instance
//   executablePath: "/usr/bin/chromium-browser", // Specify executable path for headless browser
//   args: ["--no-sandbox"], // Specify additional arguments for browser
// });
const browser = await puppeteer.launch({
  args: [
    "--disable-setuid-sandbox",
    "--no-sandbox",
    "--single-process",
    "--no-zygote",
  ],
  executablePath:
    NODE_ENV === "production"
      ? PUPPETEER_EXECUTABLE_PATH
      : puppeteer.executablePath(),
});
// Create a new Date object
const currentDate = new Date();

// Get the current date components
const day = currentDate.getDate();
const month = currentDate.getMonth() + 1; // Month is zero-indexed, so add 1
const year = currentDate.getFullYear();

// Format the date as desired (in mm/dd/yyyy format)
const formattedTodayDate = month + '/' + day + '/' + year;
  const page = await browser.newPage();
  
  await page.setContent(`
    <body>
      <section>
        <div class="">
          ${generateHTMLTable(products)}
        </div>
      </section>
      <section>
        <table class="table-calculate">
          <tr>
            <td class="table-calculate-data">Sub Total</td>
            <td class="table-calculate-data">${calculateSubTotal(products)}</td>
          </tr>
          <tr>
            <td class="table-calculate-data">GST18 (18%)</td>
            <td class="table-calculate-data">${calculateGST(products)}</td>
          </tr>
          <tr>
            <td class="table-calculate-data-final"><b>Total</b></td>
            <td class="table-calculate-data-final"><b>${calculateTotal(products)}</b></td>
          </tr>
        </table>
      </section>
      <section style='bottom: 0; margin-top: 200px;'>
      <p style="width: 80%; margin: 20px auto;">Valid Till Date: ${formattedTodayDate}</p>
      <div class="container">
          <section>
              <h2>Terms and Conditions</h2>
              <h5>we are happy to supply any furthur infromation you may need and trust that you call on us to fill your order. which will receive our prompt and careful attention</h5>
          </section>
      </div>
    </section>
    </body>
  `);

    await page.addStyleTag({
    content: `
            html {-webkit-print-color-adjust: exact;}
            @import url("https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital&display=swap");
            * {
              font-family: "Source Code Pro", monospace !important;
              user-select: none;
            }
            body {
              padding: 15px;
            }
            header {
              width: 98%;
              text-transform: uppercase;
              font-size: 25px;
            }
            .main {
              display: flex;
              align-items: center; /* Align items vertically in the center */
              justify-content: space-between; /* Spread items horizontally */
            }
            .po-id {
              text-align: right;
              margin-top: 0;
            }
            .table {
              margin-top: 15px;
            }
            thead {
              background-color: #6fccdd;
              /* background-color: black; */
              color: white;
              padding: 5px 15px;
            }
            .table-details {
              border-collapse: collapse;
              width: 100%;
            }
            .table-details-head {
              background-color: #6fccdd;
            }
            .table-details-head,
            .table-details-data {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .sub-total {
              width: 50%;
            }
            .sub-total-key {
              margin-right: 150px;
            }
            .table-calculate {
              width: 28%;
              float: right;
              margin-top: 25px;
            }
            .table-calculate-data,.table-calculate-data-final {
              padding-top: 10px;
            }
            
      .container {
        width: 80%;
        margin: 0 auto;
        border-radius: 150px;
        padding: 20px 60px;
        color: #f1f1f1;
        background-color: #6fccdd;
    }

    .container h2 {
        margin-top: 0;
    }
            `,
  });


  const formattedDate = moment().format("YYMMDD_HHMMSS");
  const fileName = `Dummy_PDF_${formattedDate}.pdf`;
  const directory = `${FILE_UPLOAD_PATH}/PDF`;
  const pdfFileName = path.join(directory, fileName);
  ensureDirectoryExists(directory);

  await page.pdf({
    path: pdfFileName,
    format: "A4",
    printBackground: true,
        margin: {
          top: "95px",
          bottom: "40px",
        },
  });


  await browser.close();
  return fileName;
};
