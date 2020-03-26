const express = require("express");
const modbus = require('jsmodbus')
const net = require('net')
// const ipdevice = '10.49.9.1'    // бурові насоси
const ipdevice = '127.0.0.1'
const portdevice = '502'

var myData = 0

const app = express()
app.use(express.static('web'))

app.get("/sensor.json", function(request, response){
    response.send(`{"temp":"${myData}"}`)
})
  
app.listen(3000)

const socket = new net.Socket()
const options = {
  'host': ipdevice,
  'port': portdevice
}
const client = new modbus.client.TCP(socket)

function fun() {
    const mp1tick = client.readHoldingRegisters(9134, 1)
    const mp2tick = client.readHoldingRegisters(9234, 1)
    const mp3tick = client.readHoldingRegisters(9334, 1)
    Promise.all([mp1tick, mp2tick, mp3tick])
    .then(function (resp) {
        myData = resp[0].response._body._values[0]  // количество ходов первого насоса
        myData = resp[1].response._body._values[0]  // количество ходов второго насоса
        myData = resp[2].response._body._values[0]  // количество ходов третьего насоса
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