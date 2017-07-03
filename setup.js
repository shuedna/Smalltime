//setup screen
require('electron').ipcRenderer.on('loadSetup', function (event, data) {
	loadSetup(data)
})

let setupData

let saveSetupMain = require('electron').remote.getGlobal('saveSetup')

function loadSetup (data) {
	//console.log(data)
	setupData = data
	if (data.setupComplete == true) {
		// load data into setup form 
	}
}

function saveSetup () {
    setupData.db = {}
    setupData.db.type = $('input[name=db]:checked').val()
    if ($('#sync')[0].checked) {
    	setupData.db.sync = true
    }else{
    	setupData.db.sync = false
    }
    if ($('input[name=db]:checked').val() == "LocalDB") {
    	setupData.db.url = $('#syncUrl').val()
    }else{
    	setupData.db.url = $('#Url').val()
    } 
    setupData.setupComplete = true
    console.log(setupData) 
    saveSetupMain(setupData)   
}

$('#Save').on('click', function () {
	saveSetup()
})