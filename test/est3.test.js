const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const { est3Array } = require('./test-data/test-data.js');
const parseWorksheet = require('../src/ioWorksheet.js');


describe('EST3 Test', function () {
        const basePath = path.resolve('./');
        const filePath = path.join(basePath, 'test/pdfs/est3.pdf');
        it('should return an array', async function() {
            const buf = await fs.promises.readFile(filePath);
            const res =  await parseWorksheet(buf);
            expect(res).to.be.an('array');
        })

        it('should return an array equal to est3Array in test-data.js', async function () {
            const buf = await fs.promises.readFile(filePath);
            const res =  await parseWorksheet(buf);
            expect(res).to.deep.equal(est3Array);
        });
});

