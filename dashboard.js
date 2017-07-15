"use strict";

const {remote, ipcRenderer} = nodeRequire('electron')
const {Menu, MenuItem} = remote

let timesDB
let projDB
let setup = remote.getGlobal('setup');
let initOptions = remote.getGlobal('initOptions');


(function init () {
	if(initOptions.setupComplete == false ) {
    	//console.log('!! Setup  not complete')
    	setup(function () {/*??*/})
  	}else if (initOptions.setupComplete == true) {
      	if (timesDB == null) { 
      		console.log('setdb')
      		if (initOptions.db.type == "LocalDB") {
	        	timesDB = new PouchDB('times')
	        	if (initOptions.db.sync == true) {
	        	}
	      	}else if (initOptions.db.type == "RemoteDB") {
	        	timesDB = new PouchDB(initOptions.db.url + '/times')
	      	}
	    }
	    timesDB.info().then(function (info) {
	        	console.log(info);
	    })
	    populateData()
	}
})()

function populateData () {
	timesDB.allDocs({include_docs:true,descending:true},function (err, response) {
		if (err) { console.log(err);alert(Error); return}
		console.log(response)
		$('<h3>').text('Total Hours: ' + totalHours(response.rows)).appendTo('#dashboard1')
		$('<p>').text('Work Hours: ' ).addClass('left').appendTo('#dashboard1')
		$('<p>').text('Break Hours: ' ).addClass('left').appendTo('#dashboard1')
		$('<p>').text('Lunch Hours: ' ).addClass('left').appendTo('#dashboard1')
		$('<p>').text('Non-Work Hours: ' ).addClass('left').appendTo('#dashboard1')
		//console.log(totalHours(response.rows))
		for ( var i = 0; 5 > i ; i++) {
			if (response.rows[i] != undefined) {
				$('<div>').attr('id',response.rows[i].doc._id).addClass('item2').appendTo('#timesdiv')
				$('<h5>').text('Hours: ' + totalHours([response.rows[i]])).css({'margin':'10px','margin-left':'2em','flex':'1'}).appendTo('#'+ response.rows[i].doc._id )
				$('<h5>').text(response.rows[i].doc.type).css({'margin':'10px','margin-left':'2em','flex':'1'}).appendTo('#'+ response.rows[i].doc._id )
				$('<h5>').text('Name: ' + response.rows[i].doc.name).css({'margin':'10px','margin-left':'2em','flex':'2'}).appendTo('#'+ response.rows[i].doc._id )
				$('<h5>').text('Project: ' + response.rows[i].doc.project).css({'margin':'10px','margin-left':'2em','flex':'2'}).appendTo('#'+ response.rows[i].doc._id )
			}
		}
	})
}


function totalHours (entries) {
	//console.log(entries)
	var totalHrs = 0
	for (var i = 0; entries.length > i; i++){
		if ( entries[i].doc.status == "active") {
			for ( var ii = 0; entries[i].doc.times[ii]; ii++) {
				//console.log(entries[i].doc.times[ii])
				entries[i].doc.times[ii].stop = new Date(entries[i].doc.times[ii].stop)
				entries[i].doc.times[ii].start = new Date(entries[i].doc.times[ii].start)
				totalHrs = (totalHrs + entries[i].doc.times[ii].stop.getTime() - entries[i].doc.times[ii].start.getTime()) 
				//console.log(totalHrs)
			}
		}
	}
	//console.log(totalHrs/3600000)
	//console.log((totalHrs/36000) - Math.floor(totalHrs/36000))
	if((totalHrs/36000) - Math.floor(totalHrs/36000) <.5) {

		totalHrs =  Math.floor(totalHrs / 36000) /100
		//console.log('total hours Math floor')
	}else{
		totalHrs = Math.ceil(totalHrs / 36000) /100
		//console.log('total hours Math ceil')
	}
	return totalHrs
}

$('#sideButton').on('click',function () {
	console.log('arrowclick')
	if ($('.arrow').val() == undefined || $('.arrow').val() == 'close') {

		$('.side').velocity({'min-width':'200px' },500)
		$('.arrow').css({'transform':'rotate(-135deg)','margin-left':'4px'})
		$('.arrow').val('open')
	}else{
		$('.side').velocity({'min-width':'40px' },500)
		$('.arrow').css({'transform':'rotate(45deg)','margin-left':'1px'})
		$('.arrow').val('close')
	}
})

$('#timer').on('click', function () {
	 ipcRenderer.send('launchTimer')
})

