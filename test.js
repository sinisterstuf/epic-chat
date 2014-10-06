var config = require('./config')
var net = require('net')
require('should')

describe('server', function() {
  it('displays welcome banner on join', function(done) {
    require('./server')
    var alice = net.connect({ port: config.port })

    alice.on('data', function(data) {
      data.toString().should.containEql('Epic Chat Server')
      alice.end()
      done()
    })
  })

  it('shows 127.0.0.1 as default nick', function(done) {
    require('./server')
    var alice = net.connect({ port: config.port })

    alice.on('data', function(data) {
      if (data.toString().indexOf('your name is: 127.0.0.1') > -1) {
        done()
      }
    })

    alice.write('\\nick\n')
  })
})
