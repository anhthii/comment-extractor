var chalk = require('chalk')
var fs = require('fs')
var log = console.log

 /** 
 *@param {buffer} buffer from a file containing comments
 *@param {string} path to the file
 *@param {string} fileOut: decide whether log comments or write them to a file 
 *@return {string} a string of accumulated comments
 */

function or(condition, fn1, fn2) {
  if (condition) fn1()
  else fn2()
}

function writeCommentsToFile(comments_str, filename) {
  var fileStream = fs.createWriteStream(filename, { flags: 'a' })
  fileStream.end(comments_str)
}

module.exports = function(buffer, path, fileOut) {
  var lines = buffer.toString('utf8').split('\n')
  var commentLine = /(?:^|\s)\/\/.*$/ // some comment
  var commentLineBlock = /^\/\*.*\*\// /* some comment */
  var commentCommon = new RegExp(commentLine.source + '|' + commentLineBlock.source)
  var commentBlockBegin = /^\/\*/
  var commentBlockEnd = /\*\/$/ 
  var result = ""
  var getContext = (index) => `Line ${index + 1} at ${path}`
  var chalkContext = (index) => log(chalk.green.bold(`Line ${index + 1} `) +
      chalk.red.bold('at') + chalk.blue.bold(` ${path}`)) 

  lines.reduce(function(accumulator, line, index) {
    line = line.trim()
    // if fileOut, concat this line to result string else log it
    if (line.match(commentCommon)) {
      or(fileOut,
        _ => result += `${getContext(index)}\n${line}\n\n`,
        _ => {
          chalkContext(index)
          log(line + '\n')
        }
      )

      return false
    } else if(line.match(commentBlockBegin)) {
      /* if a comment match commentBlockBegin regex: `/*` add this line to result
        and continue add following lines until a commentBlockEnd regex is found
        - set accumulator to true to inform that the `line` is still in a comment block
      */
      or(fileOut,
        _ => result += `${getContext(index)}\n${line}\n`,
        _ => {
          chalkContext(index)
          log(line)
        }
      )
      return true
    } else if (line.match(commentBlockEnd)) {
      // when a line match `*/` set accumulator to false to get out of a comment block
      or(fileOut,
        _ => result += line + '\n\n',
        _ => log(line + '\n')
      )
      
      return false
    } else if (accumulator) {
      or(fileOut,
        _ => result += line + '\n',
        _ => log(line)
      )  
      return true
    } else {
      return false
    }
  }, false)

  if (fileOut) {
    writeCommentsToFile(result, fileOut)
  }
}