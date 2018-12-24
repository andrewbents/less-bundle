var fs = require('fs');
var path = require('path');
var Writer = require('./writer');
var globals = require('./globals');
function buildContents(writers, imports, lines, filePath) {
    var lessRegex = globals.lessFileRegex, cssRegex = globals.cssFileRegex, stringLiteralRegex = globals.stringLiteralRegex, currentLines = [], line, hashPath, imported, file, splitLines;
    if (typeof imports[filePath] === 'undefined') {
        imports[filePath] = true;
    }
    for (var index = 0; index < lines.length; ++index) {
        line = lines[index].trim();
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
                buildContents(writers, imports, splitLines, hashPath);
            }
            continue;
        }
        currentLines.push(lines[index]);
    }
    // Push all remaining lines
    writers.push(new Writer(currentLines));
    return index;
}
module.exports = buildContents;
