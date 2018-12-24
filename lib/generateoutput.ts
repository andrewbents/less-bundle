﻿import Writer = require('./writer');

function removeEmptyStringsFromEnd(output: Array<string>) {
    while (!output[output.length - 1]) {
        output.pop();
    }
}

/**
 * Iterates through writers and invokes their write 
 * function, building the output array.
 */
function generateOutput(writers: Array<Writer>, output: Array<string>) {
    var previousLine = '';

    writers.forEach((writer) => {
        previousLine = writer.write(output, previousLine);
    });

    removeEmptyStringsFromEnd(output);
}

export = generateOutput;
