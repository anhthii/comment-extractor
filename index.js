#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var cli = require('commander')
var promisify = require('./promisify')
var commentExtractor = require('./comment-extractor')
var readFilePromise = promisify(fs.readFile)
var readDirPromise = promisify(fs.readdir)

cli
  .version('1.0.0')
  .option('-e, --extract <filename | foldername>', 'extract comments and log to console')
  .option('-w, --write <filename>', 'extract comments and write to a file')
  .parse(process.argv)

if (cli.extract && cli.write) {
  readDirRecursively(cli.extract, cli.write)
} else if (cli.extract) {
  readDirRecursively(cli.extract)
} else {
  readDirRecursively(__dirname)
}

/**
 * 
 * @param {string} the path of the root folder or path to file 
 * @param {string} fileOut - write extracted comments to this file
 */

function isNodeModules(path_str) {
  return path_str === path.join(__dirname, 'node_modules') ||
    path_str.match(/node_modules/) 
}

function readDirRecursively(path_str, fileOut) {
  if (isNodeModules(path_str)) return

  var isFile = fs.lstatSync(path_str).isFile()

  // extract comment from file if the path_str provided is a path to a js or jsx file
  if (isFile && path_str.match(/\.(jsx|js)$/m)) {
    return readFilePromise(path_str)
      .then(buffer => commentExtractor(buffer, path_str, fileOut))
      .catch(err => console.error(err))
  } else if(isFile) {
    // if path_str is a path to a file but not jsx or js file, just ignore
    return 
  }

  readDirPromise(path_str)
    .then(dirs => dirs.forEach(dir => readDirRecursively(path.join(path_str, dir))))
    .catch(err => console.error(err))
}


