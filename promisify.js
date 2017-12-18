// simple implementation of promisify function
module.exports = function promisify(fn) {
  if ('function' !== typeof fn) {
    throw new Error('expect first argument to be a function')
  }

  return function() {
    var args = Array.prototype.slice.call(arguments)

    return new Promise((resolve, reject) => {
      var cb = function(err, results) {
        if (err) return reject(err)
        return resolve(results)
      }
      args.push(cb)

      return fn.apply(null, args)
    })
  }
}