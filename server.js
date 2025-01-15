const express = require("express");
const fs = require("fs");
const path = require("path");
const pdfMake = require("pdfmake");

const app = express();
const port = 3005;

// Allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Define the path to the custom fonts
const robotoRegular = fs.readFileSync(
  path.resolve(__dirname, "public/assets/fonts/Roboto/Roboto-Regular.ttf")
);
const robotoItalic = fs.readFileSync(
  path.resolve(__dirname, "public/assets/fonts/Roboto/Roboto-Italic.ttf")
);
const robotoMedium = fs.readFileSync(
  path.resolve(__dirname, "public/assets/fonts/Roboto/Roboto-Medium.ttf")
);

const logoPath = path.resolve(__dirname, "public/assets/images/brown-logo.png");
const headerPath = path.resolve(
  __dirname,
  "public/assets/images/header-kubika.png"
);
const footerPath = path.resolve(
  __dirname,
  "public/assets/images/footer-kubika.png"
);

//logo
const logoBuffer = fs.readFileSync(logoPath);
const logoImg = logoBuffer.toString("base64");

// header
const headerBuffer = fs.readFileSync(headerPath);
const headerImg = headerBuffer.toString("base64");

// footer
const footerBuffer = fs.readFileSync(footerPath);
const footerImg = footerBuffer.toString("base64");

const fonts = {
  Roboto: {
    normal: robotoRegular,
    italics: robotoItalic,
    medium: robotoMedium,
  },
};

// Table layout definition
const tableLayouts = {
  customLayout: {
    hLineWidth: function (i, node) {
      return i === 0 || i === node.table.body.length ? 1 : 0.5;
    },
    vLineWidth: function (i, node) {
      return i === 0 || i === node.table.body[0].length ? 1 : 0.5;
    },
    vLineColor: function () {
      return '#aaaaaa';
    },
    hLineColor: function () {
      return '#aaaaaa';
    },
    paddingLeft: function (i) {
      return i === 0 ? 8 : 8;
    },
    paddingRight: function (i, node) {
      return i === node.table.widths.length - 1 ? 8 : 8;
    },
  },
};

const docDefinition = (docNo) => ({
  pageMargins: [10, 100, 10, 63],
  pageSize: "A4",
  header: function () {
    return [
      {
        image: `data:image/png;base64,${headerImg}`,
        width: 597,
      },
    ];
  },
  content: [
    {
      table: {
        margin: [0, 0, 0, 0],
        widths: ['*'],
        body: [
          [
            {
              table: {
                widths: ['20%', '4%', '*', '20%', '4%', '*'],
                body: [
                  [
                    {
                      text: 'No.',
                      width: 20,
                      height: 20,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: ':',
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: `${docNo || '-'}`,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: 'Unit Kerja',
                      width: 20,
                      height: 20,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: ':',
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: `${'-'}`,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                  ],
                  [
                    {
                      text: 'Project',
                      width: 20,
                      height: 20,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: ':',
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: `${"Projec A"}`,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: 'Tanggal',
                      width: 20,
                      height: 20,
                      fontSize: 7,
                      border: [false, false, false, false],
                    },
                    {
                      text: ':',
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: `${"15 Jan 2021"}`,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                  ],
                ],
              },
              layout: 'noBorders',
            },
          ],
          // END DEMOGRAPHY
        ],
      },
    },
  ],
  footer: function () {
    return [
      {
        image: `data:image/png;base64,${footerImg}`,
        width: 597,
      },
    ];
  },
});

// Create a route that generates a PDF
app.get("/generate-pdf", (req, res) => {
  const docNo = req.query.docNo;

  const pdfDoc = new pdfMake(fonts).createPdfKitDocument(docDefinition(docNo));

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=generated.pdf");

  pdfDoc.pipe(res);

  pdfDoc.end();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
