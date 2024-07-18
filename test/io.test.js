import {expect} from 'chai';
import fs from 'fs';
import path from 'path';
import { ioArray } from './test-data/test-data.js';
import parseIO from '../src/ioWorksheet.js';


describe('IO Test', function () {
        const basePath = path.resolve('./');
        const filePath = path.join(basePath, 'test/pdfs/io.pdf');
        it('should return an array', async function() {
            const buf = await fs.promises.readFile(filePath);
            const res =  await parseIO(buf);
            expect(res).to.be.an('array');
        })
        it('should return an array equal to ioArray in test-data.js', async function () {
            const buf = await fs.promises.readFile(filePath);
            const res =  await parseIO(buf);
            expect(res).to.deep.equal(ioArray);
        });
});
