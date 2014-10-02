var server = require('./server.js')
var net = require('net')
require('should')

describe('server', function() {
  it('display welcome banner on join', function(done) {

    var alice = net.connect({ port: 1337 })
    alice.on('data', function(data) {
      data.toString().should.containEql('Epic Chat Server')
      alice.end()
      done()
    })

  })
})
