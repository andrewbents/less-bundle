import fs = require('fs');
import path = require('path');
import Writer = require('./writer');
import globals = require('./globals');

function buildContents(
  writers: Array<Writer>,
  imports: {},
  lines: Array<string>,
  filePath: string,
  ignore: RegExp | undefined
) {
  let index = 0;
  let lessRegex = globals.lessFileRegex;
  let cssRegex = globals.cssFileRegex;
  let stringLiteralRegex = globals.stringLiteralRegex;
  let currentLines: Array<string> = [];
  let line: string;
  let hashPath: string;
  let imported: string;
  let file: string;
  let splitLines: Array<string>;

  if (typeof imports[filePath] === 'undefined') {
    imports[filePath] = true;
  }

  if (ignore && ignore.test(filePath)) {
    return 0;
  }

  for (let index = 0; index < lines.length; ++index) {
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
        buildContents(writers, imports, splitLines, hashPath, ignore);
      }

      continue;
    }

    currentLines.push(lines[index]);
  }

  // Push all remaining lines
  writers.push(new Writer(currentLines));
  return index;
}

export = buildContents;
