var net = require('net')
var sockets = []
var config = require('./config')

var commands = [
  [/^\\help/, help],
  [/^\\nick/, nick],
  [/^\\exit/, exit],
  [/^\\whois/, whois],
  [/^\\who/, who]
]

var server = net.Server(function main(socket) {
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

  socket.on('data', function parseMessage(consoleStr) {
    //append newline if missing
    consoleStr = String(consoleStr).split('\n').filter(
      function(n) { return n !== '' })

    consoleStr.forEach(function parseLine(d) {
      console.log('received message from ' + addr + ': ' + d)

      // parse input for valid commands
      if (!parseForCommands(socket, d)) {
        // if it wasn't a command then write it to everybody
        writeToAll(socket.nickname + ': ' + d + '\n\r')
      }
    })
  })

  socket.on('end', function ending() {
    var i = sockets.indexOf(socket)
    sockets.splice(i, 1)
    writeToAll(addr + ' disconnected!\n\r')
    console.log('client disconnected')
  })

})

function parseForCommands(socket, msg) {
  for (var i = 0; i < commands.length; i++) {
    if (commands[i][0].test(msg)) {
      return commands[i][1](socket, msg)
    }
  }
  return false
}

function writeToAll(msg) {
  for (var i = 0; i < sockets.length; i++) sockets[i].write(msg)
}

// \help command to show help
function help(socket) {
  socket.write(
    '\\nick\t\tshows your nickname\n\r' +
    '\\nick name\tchanges your nickname to name\n\r' +
    '\\help\t\tshows this message\n\r' +
    '\\who\t\tlists users in chat\n\r' +
    '\\whois nick\tshows the nick with IP address\n\r' +
    '\\exit\t\tquits the chat\n\r'
    )
  return true
}

// \nick command to change nickname
function nick(socket, msg) {
  if (/\\nick [a-zA-Z][a-zA-Z][a-zA-Z0-9]*/.test(msg)) {
    var addr = socket.remoteAddress
    var name = /[^ ]*$/.exec(msg)
    name = /^[a-zA-Z0-9]*/.exec(name)
    console.log('setting \'' + name + '\' as name for ' + addr)

    writeToAll(socket.nickname + ' changed name to ' + name + '\n\r')
    socket.nickname = name

  } else {
    // with no parameter, echo current name
    socket.write('your name is: ' + socket.nickname + '\n\r')
  }
  return true
}

// \exit command to close connection
function exit(socket) {
  socket.end('goodbye\n\r')
  return true
}

// \who command to list users
function who(socket) {
  for (var i = 0; i < sockets.length; i++) {
    socket.write(sockets[i].nickname + '\n\r')
  }
  return true
}

// \whois command to show someone's IP
function whois(socket, msg) {
  for (var i = 0; i < sockets.length; i++) {
    var re = new RegExp(sockets[i].nickname)
    if (re.test(msg)) {
      socket.write(
          sockets[i].nickname + ': ' +
          sockets[i].remoteAddress + '\n\r'
          )
    }
  }

  return true
}

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
