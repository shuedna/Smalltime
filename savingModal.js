"use strict"

var length = ""

const {remote, ipcRenderer} = require('electron')

ipcRenderer.on('new', function (event, data) {
	setProgress(data)
	length = data + 1

})

ipcRenderer.on('update', function (event, data) {
	console.log(data)
	updateProgress(data)
})

ipcRenderer.on('done', function (event, data) {
	console.log(done)
	done()
})

function setProgress () {
	$('#p').css({'background-color':'#84ACCE','height':'20px','width':'5%'})
}

function updateProgress (value) {
	var width = value * 100 / length
	$('#p').velocity({width:width + "%"},300)
}

function done () {
	$('#p').velocity({width:'100%'},300)
	$('<p>').text('Complete').appendTo('#p')
	$('#close').removeClass('hide')
	$('#dashboard').removeClass('hide')
}

$('#close').on('click', function () {
	ipcRenderer.send('closeSavingModal','close')
})

$('#dashboard').on('click', function () {
	ipcRenderer.send('closeSavingModal','dashboard')
})