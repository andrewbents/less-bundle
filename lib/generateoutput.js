function removeEmptyStringsFromEnd(output) {
    while (!output[output.length - 1]) {
        output.pop();
    }
}
/**
 * Iterates through writers and invokes their write
 * function, building the output array.
 */
function generateOutput(writers, output) {
    var previousLine = '';
    writers.forEach(function (writer) {
        previousLine = writer.write(output, previousLine);
    });
    removeEmptyStringsFromEnd(output);
}
module.exports = generateOutput;
