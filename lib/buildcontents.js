var fs = require('fs');
var path = require('path');
var Writer = require('./writer');
var globals = require('./globals');
function buildContents(writers, imports, lines, filePath, ignore) {
    var index = 0;
    var lessRegex = globals.lessFileRegex;
    var cssRegex = globals.cssFileRegex;
    var stringLiteralRegex = globals.stringLiteralRegex;
    var currentLines = [];
    var line;
    var hashPath;
    var imported;
    var file;
    var splitLines;
    if (typeof imports[filePath] === 'undefined') {
        imports[filePath] = true;
    }
    if (ignore && ignore.test(filePath)) {
        return 0;
    }
    for (var index_1 = 0; index_1 < lines.length; ++index_1) {
        line = lines[index_1].trim();
        if (line.indexOf('@import ') === 0) {
            // We found an import statement
            if (currentLines.length > 0) {
                writers.push(new Writer(currentLines));
                currentLines = [];
            }
            imported = line.replace(stringLiteralRegex, '$1');
            if (!(lessRegex.test(imported) || cssRegex.test(imported))) {
                imported += '.less';
            }
            // ignore node_modules and http imports
            if (imported.charAt(0) === '~' || ~imported.indexOf('http')) {
                currentLines.push(line);
                continue;
            }
            hashPath = path.resolve(filePath, '..', imported);
            if (typeof imports[hashPath] === 'undefined') {
                imports[hashPath] = true;
                file = fs.readFileSync(hashPath, 'utf8');
                splitLines = file.split(/\r\n|\n/);
                splitLines[0] = splitLines[0].trim();
                buildContents(writers, imports, splitLines, hashPath, ignore);
            }
            continue;
        }
        currentLines.push(lines[index_1]);
    }
    // Push all remaining lines
    writers.push(new Writer(currentLines));
    return index;
}
module.exports = buildContents;
