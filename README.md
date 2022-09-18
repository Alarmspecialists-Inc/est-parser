# est-parser

## installation

    yarn add @tysonalcorn/est-parser
or

    npm install @tysonalcorn/est-parser

## Introduction

 Parses select Edwards EST reports and extracts device data. Intended for applications specific to the fire alarm industry.

- IO Config Report
- EST3 Barcode Worksheet
- EST4 report parsing to come

For Node ONLY. Will NOT work in browser.

EST3 Barcode Worksheet must be printed using Microsoft Print to PDF in 3-SDU as a letter sized document. Exporting the report to a PDF directly in 3-SDU will cause the sizing of the document to be off. This will be addressed in future updates.

## Usage

    import {parseEST3, parseIO} from 'est-parser';

    parseEST3(buffer)
        .then(res => {
            console.log(res) //array of device objects
        })
    
    parseIO(buffer)
        .then(res => {
            console.log(res) //array of device objects
        })

### Return Values

#### EST3 Barcode Worksheet

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

#### IO Config Report

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
