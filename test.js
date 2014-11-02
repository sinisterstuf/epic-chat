var config = require('./config')
var net = require('net')
require('should')

describe('server', function() {
  var alice

  beforeEach(function() {
    require('./server')
    alice = net.connect({ port: config.port })
  })

  afterEach(function() {
    alice.end()
  })

  it('displays welcome banner on join', function(done) {
    alice.on('data', function(data) {
      data.toString().should.containEql('Epic Chat Server')
      alice.end()
      done()
    })
  })

  describe('command', function() {
    it('shows help', function() {
      alice.once('data', function(data) {
        data.toString().should.containEql('Epic Chat Server')

        alice.once('data', function(data) {
          data.toString().should.containEql(
            '\\nick\t\tshows your nickname\n\r' +
            '\\nick name\tchanges your nickname to name\n\r' +
            '\\help\t\tshows this message\n\r' +
            '\\exit\t\tquits the chat\n\r'
          )
          done()
        })
      })
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
          var testStr = '127.0.0.1 changed name to alice'
          data.toString().should.containEql(testStr)
          alice.once('data', function(data) {
            data.toString().should.eql('your name is: alice\n\r')
            done()
          })
        })

      })
    })

    it('lists myself with \\who', function(done) {
      alice.once('data', function(data) {
        data.toString().should.containEql('Epic Chat Server')

        alice.write('\\who\n')

        alice.once('data', function(data) {
          data.toString().should.containEql('127.0.0.1')
          done()
        })

      })
    })

    it('shows my IP with \\whois', function(done) {
      alice.once('data', function(data) {
        data.toString().should.containEql('Epic Chat Server')

        alice.write('\\whois 127.0.0.1\n')

        alice.once('data', function(data) {
          data.toString().should.eql('127.0.0.1: 127.0.0.1\n\r')
          done()
        })

      })
    })

    it('shows my name and IP with \\whois', function(done) {
      alice.once('data', function(data) {
        data.toString().should.containEql('Epic Chat Server')

        alice.write('\\nick alice\n', 'utf8', function nickcall() {

        alice.once('data', function(data) {
            var testStr = '127.0.0.1 changed name to alice\n\r'
            data.toString().should.eql(testStr)

            alice.write('\\whois alice\n')

            alice.once('data', function(data) {
              data.toString().should.eql('alice: 127.0.0.1\n\r')
              done()
            })
          })
        })

      })
    })

    it('displays exit message with \\exit', function(done) {
      alice.once('data', function(data) {
        data.toString().should.containEql('Epic Chat Server')

        alice.write('\\exit\n')

        alice.once('data', function(data) {
          data.toString().should.containEql('goodbye')
          alice.on('end', function() {
            done()
          })
        })

      })
    })

  })

  it('prints messages to all', function(done) {
    alice.once('data', function(data) {
      data.toString().should.containEql('Epic Chat Server')
      var bob = net.connect({ port: config.port })

      bob.once('data', function(data) {
        data.toString().should.containEql('Epic Chat Server')

        bob.once('data', function(data) {
          data.toString().should.containEql('hi')

          alice.once('data', function(data) {
            data.toString().should.containEql('hi')
            alice.end()
            bob.end()
            done()
          })

        })
      })

      bob.write('hi')
    })

  })
})
