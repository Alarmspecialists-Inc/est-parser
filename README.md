# est-parser

## Introduction

 Parses select EST reports and extracts device data
    -IO Config Report
    -EST3 Barcode Worksheet
    -EST4 report parsing to come

For Node ONLY. Will NOT work in browser.

## Usage

    import {parseEST3, parseIO} from 'est-parser';

    parseEST3(buffer)
        .then(res => {
            console.log(res) // array of device objects
        })
    
    parseIO(buffer)
        .then(res => {
            console.log(res) //returns array of device objects
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
        model: "PS",
        address: "1",
        message1: "SMOKE DETECTOR L1D1",
        message2: "ABOVE FACP",
        loop: "1",
        type: "Smoke",
        barcode: "0000000000", // all devices without barcodes will return this string
    ]
