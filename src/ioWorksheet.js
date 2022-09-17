const { PdfReader } = require("pdfreader");


const TABLE_TYPE_REGEX = /^User Key/;
const VALID_REGEX = /SAS Panel Configuration/;
const VALID_PAGE_REGEX = /^(Verification|Verify|Alt. Verify|Alt. Vfy)$/;
const HEADER_REGEX = /^(Detectors|Modules|Loop|Address|Model|Device Type|Base Type|Serial Number|Messages|Sensitivity|Alt. Sens.|Verification|Verify|Alt. Verify|Alt. Vfy|Pre Alarm|Alt. Pre|Follows|Latched|Follow CO|Operation|AltOperation|System Events|Latching)$/;
const DETECTOR_X_VARIANCE = 1.0;
const DETECTOR_Y_VARIANCE = 1.0;
const DETECTOR_Y_NEXT_VARIANCE = 1.01;
const MODULE_Y_NEXT_VARIANCE = 0.1;
const MODULE_Y_NEXT_VARIANCE_1 = 0.01;
const MODULE_X_VARIANCE = 0.01;

const detectorColumns = [
  {
    name: "loop",
    x: 1.484,
    y: 1,
  },
  {
    name: "address",
    x: 3.453,
    y: 1,
  },
  {
    name: "type",
    x: 5.984,
    y: 2,
  },
  {
    name: "message1",
    x: 18.922,
    y: 1,
  },
  {
    name: "message2",
    x: 18.922,
    y: 2,
  },
  {
    name: "model",
    x: 5.984,
    y: 1,
  },
  {
    name: "barcode",
    x: 13.859,
    y: 2,
  },
];

const moduleColumns = [
  {
    name: "loop",
    x: 1.484,
  },
  {
    name: "address",
    x: 3.734,
  },
  {
    name: "type",
    x: 10.016,
  },
  {
    name: "message1",
    x: 22.531,
  },
  {
    name: "message2",
    x: 32.844,
  },
  {
    name: "model",
    x: 6.547,
  },
  {
    name: "barcode",
    x: 18.125,
  },
];

const getTextType = (page, item) => {
  const detectorItem = page.find((item) => item.text === "Detectors");
  const moduleItem = page.find((item) => item.text === "Modules");
  const itemY = parseFloat(item.y);
  const itemX = parseFloat(item.x);
  const yPos = page.find(
    (pageItem) =>
      itemY - parseFloat(pageItem.y) < DETECTOR_Y_VARIANCE &&
      itemY - parseFloat(pageItem.y) > 0 &&
      Math.abs(itemX - pageItem.x) <= DETECTOR_X_VARIANCE
  )
    ? 2
    : 1;
    
  if (moduleItem && detectorItem) {
    const afterModuleHeader = parseFloat(moduleItem.y) < itemY;
    const afterDeviceHeader = parseFloat(detectorItem.y) < itemY
    if(afterDeviceHeader && !afterModuleHeader) return {
        column: detectorColumns.find(
        (column) =>
          Math.abs(itemX - column.x) <= DETECTOR_X_VARIANCE &&
          column.y === yPos
      ),
        type: 'detector'
    };
    if(afterModuleHeader) return {
        column: moduleColumns.find(
        (column) => Math.abs(itemX - column.x) < MODULE_X_VARIANCE
        ),
        type: 'module'
    };
    return {}
  };
  if (moduleItem) return {
    column: moduleColumns.find(
    (column) => Math.abs(itemX - column.x) < MODULE_X_VARIANCE
    ),
    type: 'module'
};
  if (detectorItem) return {
    column: detectorColumns.find(
    (column) =>
      Math.abs(itemX - column.x) <= DETECTOR_X_VARIANCE &&
      column.y === yPos
  ),
    type: 'detector'
};
  return {};
};

const parsePage = (page = []) => {
  let devices = [];
  let device = {};
  const detectorItem = page.find((item) => item.text === "Detectors");
  const moduleItem = page.find((item) => item.text === "Modules");
  const tableTypeItem = page.find((item) => TABLE_TYPE_REGEX.test(item.text));
  const validPage = page.find((item) => VALID_PAGE_REGEX.test(item.text));
  const startY = detectorItem
    ? parseFloat(detectorItem.y)
    : moduleItem
    ? parseFloat(moduleItem.y)
    : null;
  const stopY = tableTypeItem ? parseFloat(tableTypeItem.y) : 100000;
  let currentDeviceY = null;
  page.forEach((item, index) => {
    if (
      validPage &&
      startY &&
      parseFloat(item.y) > startY &&
      parseFloat(item.y) < stopY &&
      !HEADER_REGEX.test(item.text)
    ) {
      const {column, type} = getTextType(page, item);
      if (column && column.name) {
          let next = null;
          if(type === 'detector') {
            next = DETECTOR_Y_NEXT_VARIANCE
          }  else {
            next = MODULE_Y_NEXT_VARIANCE;
          }
        if (currentDeviceY && ((item.y - currentDeviceY) >= next)) {
          if(Object.keys(device).length) devices.push(device);
          device = {};
          device[column.name] = item.text;
          currentDeviceY = item.y;
        } else {
          if(!currentDeviceY) currentDeviceY = item.y;
          device[column.name] = item.text;
          if(!getTextType(page, page[index + 1])?.column && type === 'module') {
            if(Object.keys(device).length) devices.push(device)
            device = {};
          } else if (!getTextType(page, page[index + 1])?.column && type === 'detector' && column.y === 2 && page[index + 1].y - item.y >= DETECTOR_Y_NEXT_VARIANCE) {
            if(Object.keys(device).length) devices.push(device)
            device = {};
          };
        }
      }
    }
    if (!page[index + 1] && Object.keys(device).length) devices.push(device)
  });
  
  return devices;
};

const parseWorksheet = (buf = Buffer()) => {
  let validWorksheet = false;
  let itemArray = [];
  let pageArray = [];
  return new Promise((resolve, reject) => {
  new PdfReader().parseBuffer(buf, (err, item) => {
    if (err) reject(err);
    if (item && item.text) itemArray.push(item);
    if (item && item.text && VALID_REGEX.test(item.text)) validWorksheet = true
    if (item?.page) {
      const sortedPage = itemArray.sort(
        (a, b) => parseFloat(a.y) - parseFloat(b.y)
      );
      const parsedPage = parsePage(sortedPage);
      pageArray.push(parsedPage);
      itemArray = [];
    }
    if(!item) {
      if(!validWorksheet) reject('Invalid PDF');
      resolve(pageArray.flat())
    } 
  });
})
};

module.exports = parseWorksheet;