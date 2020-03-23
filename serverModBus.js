const express = require("express");
const modbus = require('jsmodbus')
const net = require('net')

var myData = 0

const app = express()
app.use(express.static('web'))

app.get("/sensor.json", function(request, response){
    response.send(`{"temp":"${myData}"}`)
})
  
app.listen(3000)

const socket = new net.Socket()
const options = {
  'host': '127.0.0.1',
  'port': '502'
}
const client = new modbus.client.TCP(socket)

function fun() {
    client.readHoldingRegisters(0, 1)
    .then(function (resp) {
        myData = resp.response._body._values[0]
        setTimeout(fun, 100)
    })
    .catch(function (e) {
        console.error(e)
        socket.end()
    })
}

socket.on('connect', fun)

socket.on('close', function(e) {
    console.log('reconnect')
    setTimeout(() => socket.connect(options), 1000)
})
  
socket.on('error', () => console.log('error'))

socket.connect(options)