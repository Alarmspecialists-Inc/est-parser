const { PdfReader } = require("pdfreader");

let xArray = [1.6, 15.25, 24, 34, 42.5];
const getWorksheetColumns = () => { 
  return [
  {
    name: "type",
    x: xArray[0],
    y: 2,
  },
  {
    name: "label",
    x: xArray[0],
    y: 1,
  },
  {
    name: "message1",
    x: xArray[1],
    y: 1,
  },
  {
    name: "message2",
    x: xArray[1],
    y: 2,
  },
  {
    name: "model",
    x: xArray[2],
    y: 1,
  },
  {
    name: "logicalAddress",
    x: xArray[3],
    y: 2,
  },
  {
    name: "barcode",
    x: xArray[4],
    y: 2,
  },
]
};
const parsePage = (page = {}) => {
  let devices = [];
  let i = 0;
  const bcRegex = /a\*/
  const worksheetColumns = getWorksheetColumns();
  for (let obj in page) {
    i++;
    let device = {};
    let xVariance = 1.5;
    let yVariance = 0.1
    page[obj].forEach((item, index) => {
      const y1 = parseFloat(obj);
      const x = parseFloat(item.x);
      const y = parseFloat(item.y);
      let yPos = (y - y1) <= yVariance ? 1 : 2;
      if(bcRegex.test(item.text)) yPos = null
      const infoTypeColumn = worksheetColumns.find(
        (column) => Math.abs(column.x - x) <= xVariance && column.y === yPos
      );
      const infoType = infoTypeColumn ? infoTypeColumn.name : null;
      if (infoType) device[infoType] = item.text;
    });
    if(Object.keys(device).length) devices.push(device);
  }
  return devices;
};

const parseWorksheet = (buf = Buffer()) => {
  let validWorksheet = false;
  let panelName = '';
  let xValues = [];
  let allXValues = [];
  let pageArray = [];
  let page = {};
  let devices = [];
  const yVariance = 3.0;
  return new Promise((resolve, reject) => {
    new PdfReader().parseBuffer(buf, (err, item) => {
        if (err) reject(err);
        if (item) {
          //console.log(item.text) //for debugging, delete when done
          const estRegexp = /EST3 System Definition Utility*/
          const regexp = /((\d|10|11|12)\/\d\d\/\d\d\d\d (\d|10|11|12):\d\d:\d\d (AM|PM))|Project:*|EST3 System Definition Utility*|Signature Detectors\/Modules Barcode Worksheet|Page \d*|^Text$|^Barcode$|^Device Type$|^Location$|^Device Address$|^Label$|^Model$|^Serial Number$|^Number$|^Base$|^Personality$|\(Loop [1-2]\)/;
          if (!regexp.test(item.text) && item.text) {
            pageArray.push(item);
            allXValues.push(item.x);
          }
          if(estRegexp.test(item.text) && item.text) validWorksheet = true;
          if(item && item.text) {
            const cabRegex = /(?<=.*Cabinet:\s+)\w*(?=\s+3-S(S|D)DC(1|2):.*)/
            const regResult = cabRegex.exec(item.text);
            if (regResult && (regResult[0] !== panelName)) panelName = regResult[0];
            //if (regResult) console.log(regResult) //for debugging
          }
        }
    
        if (!item || item.page) {
          panelName = panelName.replace(/_/g, ' ');
          const sortedPage = pageArray.sort((a, b) => parseFloat(a.y) - parseFloat(b.y));
          sortedPage.forEach((textItem) => {
            const yPositions = Object.keys(page);
            if (!yPositions.length) {
              page[textItem.y] = [textItem];
            } else {
              const y = yPositions.find(
                (position) =>
                  parseFloat(textItem.y) - parseFloat(position) <= yVariance
              );
              if (y) page[y].push(textItem);
              if (!y) page[textItem.y] = [textItem];
            }
          });
          let uniqueValues = []
          allXValues.sort((a,b) => parseFloat(a)-parseFloat(b)).forEach(value => {
            if (!xValues.find(value1 => value === value1 ) || !xValues.length) uniqueValues.push(value)
          })
          let variances = [];
          uniqueValues.forEach((currentValue, i) => {
            variances.push(uniqueValues[i+1] - currentValue);
          });
          const sortedVariances = variances.sort((a,b) => parseFloat(a) - parseFloat(b));
          const xVariance = sortedVariances[1];
          allXValues.forEach(x => {
            if(!xValues.find(x1 => Math.abs(x-x1) <= xVariance + 1.35)) xValues.push(x);
          })
          if(xValues.length === 5) xArray = xValues.sort((a,b) => parseFloat(a) - parseFloat(b))
          let parsedPage = parsePage(page);
          parsedPage = parsedPage.map(device => ({...device, panelName}))
          devices.push(parsedPage);
          pageArray = [];
          page = {};
          xValues = [];
          allXValues = [];
        }
        if (!item) {
          if (validWorksheet) resolve(devices.flat());
          //if (!validWorksheet) reject('Invalid PDF')
        }; 
      });
  })
};

module.exports = parseWorksheet;