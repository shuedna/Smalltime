"use strict";
// main thread file for SmallTime 
//require('require-rebuild')();
const PouchDB = require('pouchdb');
const {app, BrowserWindow, webContents, Menu} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs')


let timeDB;
let win;
let splash;
let recap;
let setupWindow;
let initOptions;

(function init () {
  app.on('ready',function () {
    readSetup(createTimerWindow)
  })
})()


function createTimerWindow (initOptions){
  if (win == null||undefined) {
  	win = new BrowserWindow({frame:initOptions.timerFrame,width: 220, height: 210,titleBarStyle:'hidden-inset',resizable:false, x:initOptions.position.x, y:initOptions.position.y})
    //Menu.setApplicationMenu(null)
  	/*splash = new BrowserWindow({parent: win,modal: true,width: 300, height: 100,frame: false,show:false})
    	splash.loadURL(url.format({
      	pathname: path.join(__dirname, 'splash.html'),
      	protocol: 'file:',
      	slashes: true
    	}))*/
  	win.loadURL(url.format({
    	pathname: path.join(__dirname, 'index.html'),
    	protocol: 'file:',
    	slashes: true
  	}))
    	
    	/*splash.on('ready-to-show',function() {
    		splash.show()
  	  	var killSplash = setInterval(function(){
  	  		splash.close();
  	  		clearInterval(killSplash)
  	  	},3500)
  	})*/
  	
  	win.on('ready-to-show',function () {
  		win.show()
  	})

    	/*var string = JSON.stringify(Menu.getApplicationMenu())
    	fs.writeFile('menu.json', string , (err) => {
    		if (err) {throw err}
    	})*/
  }
}

function readSetup (loadWindow) {
  fs.readFile('options.json','utf8',(err, data) => {
    if (err) throw err;
    global.initOptions = JSON.parse(data)
    if (global.initOptions.setupComplete == true) {
      if (global.initOptions.db.type == "LocalDB") {
        timeDB = new PouchDB('times')
        if (global.initOptions.sync == true) {
        }
      }else if (global.initOptions.db.type == "RemoteDB") {
        timeDB = new PouchDB(url + '/times')
      }
      timeDB.info().then(function (info) {
        console.log(info);
      })
    }


    loadWindow(global.initOptions)
    console.log(global.initOptions)
  });
}

function setup (parent, nextAction) { 
  setupWindow = new BrowserWindow ({parent: parent,modal: true,width:400, height:400, show:false})

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

global.remoteData = function (obj) {
	recap = new BrowserWindow({width: 800, height: 600,titleBarStyle: 'hiddenInset',show:false})
	//console.log(obj)

	recap.loadURL(url.format({
    	pathname: path.join(__dirname, 'TimeRecap.html'),
    	protocol: 'file:',
    	slashes: true
  	}))


  	recap.on('ready-to-show',function () {
  		recap.webContents.send('displayTimes', obj)
  		recap.show()

  	})
}

global.saveDB = function (data) {
  //console.log('saveDB ')

  if(global.initOptions.setupComplete == false ) {
    //console.log('!! Setup  not complete')
    setup(recap, function () {saveDB(data)})
  }else {
    for (var i = 0; data.length > i ; i++) {
      if (data[i].status == "active") {
        console.log(data[i])
      }
    } 
  }
}

global.saveSetup = function (data) {
  global.initOptions = data
  var string = JSON.stringify(data)
  fs.writeFile('options.json', string , (err) => {
    if (err) {throw err}
  })
  readSetup(createTimerWindow)
}




