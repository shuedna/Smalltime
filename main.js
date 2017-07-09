"use strict";
// main thread file for SmallTime 
//require('require-rebuild')();
//const PouchDB = require('pouchdb');
const {app, BrowserWindow, webContents, Menu, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs')

let timer;
let mainWindow;
let setupWindow;
let savingModalWindow;

(function init () {
  app.on('ready',function () {
    console.log(process.argv)
    if (process.argv[2] == 'dashboard') {
      readSetup(function () {global.mainWindowFunction('dashboard',null)})
    }else{
      readSetup(function () {global.createTimerWindow()})
    }
  })
})()



global.createTimerWindow = function(){
  if (timer == null||undefined) {
    var initOptions = global.initOptions
  	timer = new BrowserWindow({frame:initOptions.timerFrame,width: 220, height: 210,titleBarStyle:'hidden-inset',resizable:false, x:initOptions.position.x, y:initOptions.position.y})
  	timer.loadURL(url.format({
    	pathname: path.join(__dirname, 'timer.html'),
    	protocol: 'file:',
    	slashes: true
  	}))
  	timer.on('ready-to-show',function () {
  		timer.show()
  	})
  }
}

function readSetup (loadWindow) {
  fs.readFile('options.json','utf8',(err, data) => {
    if (err) throw err;
    global.initOptions = JSON.parse(data)
    //console.log(global.initOptions)
    loadWindow()
  });
}

global.setup = function (nextAction) { 
  setupWindow = new BrowserWindow ({parent: mainWindow,modal: true,width:400, height:400, show:false})

  setupWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'setup.html'),
    protocol: 'file:',
    slashes: true
  }))

  setupWindow.on('ready-to-show', function () {
    setupWindow.webContents.send('loadSetup',global.initOptions)
    setupWindow.show()
  })
}

global.mainWindowFunction = function (page, data) {
  //console.log('mainWindowFunction')
	if (mainWindow == null) {
    mainWindow = new BrowserWindow({width: 800, height: 600,titleBarStyle: 'hiddenInset',show:false})

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }else{

  }
  if (page == 'TimeRecap') {
    mainWindow.loadURL(url.format({
    	pathname: path.join(__dirname, 'timeRecap.html'),
    	protocol: 'file:',
    	slashes: true
  	}))
  	mainWindow.on('ready-to-show',function () {
  		mainWindow.webContents.send('displayTimes', data)
  		mainWindow.show()
  	})
  }else if (page == 'dashboard') {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dashboard.html'),
      protocol: 'file:',
      slashes: true
    }))
    mainWindow.on('ready-to-show',function () {
      //mainWindow.webContents.send('displayTimes', data)
      mainWindow.show()
    })
  }
}

global.saveSetup = function (data) {
  global.initOptions = data
  var string = JSON.stringify(data)
  fs.writeFile('options.json', string , (err) => {
    if (err) {throw err}
    readSetup(createTimerWindow)
  })
}

ipcMain.on('clearTimes',function () {
  if (timer != null) {
    timer.webContents.send('clearTimeData')
  }
})

ipcMain.on('savingModal', function (event, action, data) {
  if (action == 'new') {
    savingModalWindow = new BrowserWindow({parent: mainWindow,modal: true,width: 300, height: 150,frame: false,show:false})
    savingModalWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'savingModal.html'),
      protocol: 'file:',
      slashes: true
    }))

    savingModalWindow.on('ready-to-show',function () {
      event.sender.send('savingModalReady','ready')
      savingModalWindow.webContents.send(action, data)
      savingModalWindow.show()

    })
  }else{
    savingModalWindow.webContents.send(action, data)
  }
})

ipcMain.on('closeSavingModal', function (event, action) {
  savingModalWindow.close()
  if (action == 'close') {
    mainWindow.close()
  }else if (action == 'dashboard') {
    mainWindow.close()
    global.mainWindowFunction('dashboard',null)
  } 
})