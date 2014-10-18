//TODO: command array: make the commands parser go throw some kind of array of
//command-names with functions to call for each command

//TODO: add command \whois which returns name <-> IP

var net = require('net')
var sockets = []
var config = require('./config')

var server = net.Server(function (socket) {
    var addr = socket.remoteAddress
    socket.nickname = addr
    sockets.push(socket)

    socket.write(
        'Epic Chat Server\n\r' +
        'For help type \\help\n\r' +
        'Just type to chat!\n\r'
        )
    console.log('new connection from: ' + addr)
    writeToAll(addr + ' connected!\n\r')

    // sends a message to all sockets except the current socket
    function writeToAll(msg) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i] === socket) continue // skip myself
            sockets[i].write(msg)
        }
    }

    socket.on('data', function(consoleStr) {
        //append newline if missing
        var consoleStr = String(consoleStr).split('\n').filter(
            function(n) { return n != "" })

        consoleStr.forEach(function(d) {
          console.log('received message from ' + addr + ': ' + d)

          // parse input for valid commands
          if (!parseForCommands(d)) {
              // if it wasn't a command then write it to everybody
              writeToAll(socket.nickname + ': ' + d + '\n\r')
          }
        })
    })

    function parseForCommands(msg) {
        // \help command to show help
        if (/^\\help/.test(msg)) {
            socket.write(
                '\\nick\t\tshows your nickname\n\r' +
                '\\nick name\tchanges your nickname to name\n\r' +
                '\\help\t\tshows this message\n\r' +
                '\\exit\t\tquits the chat\n\r'
            )
            return true
        }

        // \nick command to change nickname
        if (/^\\nick/.test(msg)) {
            if (/\\nick [a-zA-Z][a-zA-Z][a-zA-Z0-9]*/.test(msg)) {
                var name = /[^ ]*$/.exec(msg)
                name = /^[a-zA-Z0-9]*/.exec(name)
                console.log('setting \'' + name + '\' as name for ' + addr)

                writeToAll(
                    socket.nickname + ' changed name to ' + name + '\n\r'
                    )
                socket.nickname = name

            } else {
                // with no parameter, echo current name
                socket.write('your name is: ' + socket.nickname + '\n\r')
            }
            return true
        }

        // \exit command to quit
        if (/^\\exit/.test(msg)) {
            socket.end('goodbye\n\r')
            return true
        }

        // \who command to list users
        if (/^\\who/.test(msg)) {
            for (var i = 0; i < sockets.length; i++) {
                socket.write(sockets[i].nickname + '\n\r')
            }
        }

        return false
    }

    socket.on('end', function() {
        var i = sockets.indexOf(socket)
        sockets.splice(i, 1)
        writeToAll(addr + ' disconnected!\n\r')
        console.log('client disconnected')
    })

})

process.on('SIGINT', function shutdown() {
  console.log('\ngracefully shutting down')
  server.close() // stops new connections

  sockets.forEach(function(socket) {
    console.log('kicking ' + socket.nickname)
    socket.write('server shutting down, closing connection\n')
    socket.destroy()
  })

  console.log('exiting')
  process.exit()
})

server.on('error', function(error) {
  if (error.code === 'EADDRINUSE') {
    console.error('Epic Chat is already running on port ' + config.port)
  }
})
server.listen(config.port)

console.log('Starting epic chat server on port', config.port)
