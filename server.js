const express = require("express");
const fs = require("fs");
const path = require("path");
const pdfMake = require("pdfmake");
const axios = require("axios");

require("dotenv").config();
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
const robotoBold = fs.readFileSync(
  path.resolve(__dirname, "public/assets/fonts/Roboto/Roboto-Bold.ttf")
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

// logo
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
    bold: robotoBold,
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
      return "#aaaaaa";
    },
    hLineColor: function () {
      return "#aaaaaa";
    },
    paddingLeft: function (i) {
      return i === 0 ? 8 : 8;
    },
    paddingRight: function (i, node) {
      return i === node.table.widths.length - 1 ? 8 : 8;
    },
  },
};

const docDefinition = (docNo, additionalData, formatted) => ({
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
        widths: ["*"],
        body: [
          [
            {
              table: {
                widths: ["20%", "4%", "*", "20%", "4%", "*"],
                body: [
                  [
                    {
                      text: "No.",
                      width: 20,
                      height: 20,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: ":",
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: `${
                        additionalData?.doc_no_spb +
                          " - " +
                          additionalData?.doc_type_spb || "-"
                      }`,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: "Unit Kerja",
                      width: 20,
                      height: 20,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: ":",
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: `${additionalData?.unit_kerja || "-"}`,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                  ],
                  [
                    {
                      text: "Project",
                      width: 20,
                      height: 20,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: ":",
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: `${additionalData?.project?.nama || "-"}`,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: "Tanggal",
                      width: 20,
                      height: 20,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: ":",
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                    {
                      text: `${
                        additionalData?.tanggal_dibuat_spb +
                          " - " +
                          additionalData?.tanggal_berahir_spb || "-"
                      }`,
                      fontSize: 8,
                      border: [false, false, false, false],
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        ],
      },
    },
    {
      margin: [20, 15, 20, 0],
      table: {
        widths: ["20%", "10%", "20%", "10%", "20%", "*"],
        body: [
          [
            {
              text: "Nama Barang",
              fontSize: 10,
              alignment: "center",
              bold: true,
              border: [true, true, true, true],
            },
            {
              text: "Kuantitas",
              fontSize: 10,
              alignment: "center",
              bold: true,
              border: [true, true, true, true],
            },
            {
              text: "Harga",
              fontSize: 10,
              alignment: "center",
              bold: true,
              border: [true, true, true, true],
            },
            {
              text: "PPN",
              fontSize: 10,
              alignment: "center",
              bold: true,
              border: [true, true, true, true],
            },
            {
              text: "Total",
              fontSize: 10,
              alignment: "center",
              bold: true,
              border: [true, true, true, true],
            },
            {
              text: "Keterangan",
              fontSize: 10,
              alignment: "center",
              bold: true,
              border: [true, true, true, true],
            },
          ],
        ],
      },
    },
    // Vendor Products Table
    ...formatted.map((vendor) => ({
      margin: [20, 0, 20, 0],
      table: {
        widths: ["20%", "10%", "20%", "10%", "20%", "*"],
        body: [
          [
            // Vendor Name as a Full Colspan
            {
              text: vendor.vendor_name,
              colSpan: 6,
              alignment: "left",
              fontSize: 8,
              bold: true,
              border: [true, false, true, true],
            },
            {},
            {},
            {},
            {},
            {},
          ],
          ...vendor.products.map((product) => [
            {
              text: `- ${product?.produk_data?.nama ?? "-"}`,
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: product?.stok ?? "-",
              fontSize: 8,
              alignment: "center",
              border: [true, true, true, true],
            },
            {
              text: formatCurrency(product?.harga ?? "-", "IDR", "id-ID"),
              fontSize: 8,
              alignment: "center",
              border: [true, true, true, true],
            },
            {
              text: product?.ppn?.ppn_percentage + "%" ?? "-",
              fontSize: 8,
              alignment: "center",
              border: [true, true, true, true],
            },
            {
              text: formatCurrency(
                product?.subtotal_item ?? "-",
                "IDR",
                "id-ID"
              ),
              fontSize: 8,
              alignment: "center",
              border: [true, true, true, true],
            },
            {
              text: product?.description ?? "-",
              fontSize: 8,
              alignment: "center",
              border: [true, true, true, true],
            },
          ]),
        ],
      },
      layout: "customLayout",
    })),
    {
      margin: [20, 30, 20, 0],
      table: {
        widths: ["*", "*", "*", "*"],
        body: [
          [
            {
              text: "Dibuat Oleh",
              fontSize: 10,
              bold: true,
              alignment: "center",
              // border: [true, true, true, true],
            },
            {
              text: "Kepala Gudang",
              fontSize: 10,
              bold: true,
              alignment: "center",
              // border: [true, true, true, true],
            },
            {
              text: "Mengetahui",
              fontSize: 10,
              bold: true,
              alignment: "center",
              // border: [true, true, true, true],
            },
            {
              text: "Menyetujui",
              fontSize: 10,
              bold: true,
              alignment: "center",
              // border: [true, true, true, true],
            },
          ],
          [
            {
              qr: `${
                additionalData?.created_by?.name +
                  " - " +
                  additionalData?.created_by?.created_at ?? "-"
              }`,
              alignment: "center",
              fit: 50,
            },
            {
              qr: `${
                additionalData?.know_spb_kepalagudang?.user_name +
                  " - " +
                  additionalData?.know_spb_kepalagudang?.approve_date ?? "-"
              }`,
              alignment: "center",
              fit: 50,
            },
            {
              qr: `${
                additionalData?.know_spb_marketing?.user_name +
                  " - " +
                  additionalData?.know_spb_marketing?.approve_date ?? "-"
              }`,
              alignment: "center",
              fit: 50,
            },
            {
              qr: `${
                additionalData?.payment_request_owner?.user_name +
                  " - " +
                  additionalData?.payment_request_owner?.approve_date ?? "-"
              }`,
              alignment: "center",
              fit: 50,
            },
          ],
          [
            {
              text: `${additionalData?.created_by?.name ?? "-"}`,
              alignment: "center",
              fontSize: 8,
            },
            {
              text: `${
                additionalData?.know_spb_kepalagudang?.user_name ?? "-"
              }`,
              alignment: "center",
              fontSize: 8,
            },
            {
              text: `${additionalData?.know_spb_marketing?.user_name ?? "-"}`,
              alignment: "center",
              fontSize: 8,
            },
            {
              text: `${
                additionalData?.payment_request_owner?.user_name ?? "-"
              }`,
              alignment: "center",
              fontSize: 8,
            },
          ],
        ],
      },
      layout: "noBorders",
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

const groupByVendor = (data) => {
  const grouped = {};

  // Use `produk` array from the response
  data.produk.forEach((product) => {
    const vendorName = product.vendor.name;

    if (!grouped[vendorName]) {
      grouped[vendorName] = {
        vendor_name: vendorName,
        products: [],
      };
    }

    grouped[vendorName].products.push(product);
  });

  return Object.values(grouped);
};

const formatCurrency = (amount, currency = "IDR", locale = "id-ID") => {
  // if (typeof amount !== "number") {
  //   throw new Error("Amount must be a number");
  // }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

app.get("/generate-pdf", async (req, res) => {
  const docNo = req.query.docNo;

  try {
    const apiUrl = process.env.API_URL;
    const response = await axios.get(`${apiUrl}/show/${docNo}`);

    const additionalData = response.data;
    console.log("datae", additionalData);
    const formatted = groupByVendor(additionalData);
    // console.log("formatted", JSON.stringify(formatted));

    const pdfDoc = new pdfMake(fonts).createPdfKitDocument(
      docDefinition(docNo, additionalData, formatted)
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=generated.pdf");

    pdfDoc.pipe(res);

    pdfDoc.end();
  } catch (error) {
    console.error("Error fetching additional data:", error);
    res.status(500).send("Error generating PDF");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
