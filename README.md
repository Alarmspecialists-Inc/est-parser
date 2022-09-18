# est-parser

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
  - [Return Values](#return-values)
    - [EST3 Barcode Worksheet](#est3-barcode-worksheet)
    - [IO Config Report](#io-config-report)
- [Testing](#testing)

## Introduction

 Parses select Edwards EST reports and extracts device data. Intended for applications specific to the fire alarm industry.

- IO Config Report
- EST3 Barcode Worksheet
- EST4 report parsing to come

For Node ONLY. Will NOT work in browser. Relatively fast execution time allows for use in serverless functions (tested with Netlify Functions and GCP Cloud Functions).

EST3 Barcode Worksheet must be printed using Microsoft Print to PDF in 3-SDU as a letter sized document. Exporting the report to a PDF directly in 3-SDU will cause the sizing of the document to be off. This will be addressed in future updates.

## Installation

    yarn add @tysonalcorn/est-parser
or

    npm install @tysonalcorn/est-parser

## Usage

```javascript

import {parseEST3, parseIO} from '@tysonalcorn/est-parser';

parseEST3(buffer) //buffer from EST3 Barcode Worksheet
    .then(res => {
        console.log(res) //array of device objects
    })
    
parseIO(buffer) //buffer from IO Config Report
    .then(res => {
        console.log(res) //array of device objects
    })
```

### Return Values

#### EST3 Barcode Worksheet

```javascript
[
    {
        label: "SD_1_DLR",
        message1: "SMOKE DETECTOR L1D1  ",
        message2: "AT FACP",
        model: "PS",
        type: "SMOKE",
        logicalAddress: "01020001",
        barcode: "3902009904",
        panelName: "FACP",
    }
]
```

#### IO Config Report

```javascript
[
    {
        model: "PS",
        address: "1",
        message1: "SMOKE DETECTOR L1D1",
        message2: "ABOVE FACP",
        loop: "1",
        type: "Smoke",
        barcode: "0000000000", //all devices without barcodes will return this string
    }
]
```

## Testing

    yarn test
or

    npm test
