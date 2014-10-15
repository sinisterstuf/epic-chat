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

  describe('commands', function() {
    var alice

    beforeEach(function() {
      require('./server')
      alice = net.connect({ port: config.port })
    })

    afterEach(function() {
      alice.end()
    })

    it('shows 127.0.0.1 as default nick', function(done) {
      alice.once('data', function(data) {
        data.toString().should.containEql('Epic Chat Server')

        alice.once('data', function(data) {
          data.toString().should.containEql('your name is: 127.0.0.1')
          done()
        })
      })

      alice.write('\\nick\n')
    })

    it('changes nick with \\nick', function(done) {
      alice.once('data', function(data) {
        data.toString().should.containEql('Epic Chat Server')

        alice.write('\\nick alice\n', 'utf8', function nickcall() {
          alice.write('\\nick\n')
        })

        alice.once('data', function(data) {
          data.toString().should.containEql('alice')
          done()
        })

      })
    })


  })


  it('prints messages to all but the sender', function(done) {
    require('./server')
    var bob = net.connect({ port: config.port })
    var alice = net.connect({ port: config.port })

    alice.once('data', function(data) {
      data.toString().should.containEql('Epic Chat Server')

      alice.once('data', function(data) {
        data.toString().should.containEql('hi')
        alice.end()
        bob.end()
        done()
      })

      bob.write('hi')
    })

  })
})
