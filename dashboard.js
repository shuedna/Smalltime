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
	        	projDB = new PouchDB('proj')
	        	if (initOptions.db.sync == true) {
	        	}
	      	}else if (initOptions.db.type == "RemoteDB") {
	        	timesDB = new PouchDB(initOptions.db.url + '/times')
	      	}
	    }
	    timesDB.info().then(function (info) {
	        	console.log(info);
	    })
		dashboard()

	    $('#dashboardBtn').on('click',function () {
	    	clearMain()
			dashboard()
	    })
	   	$('#timesBtn').on('click',function () {
	    	clearMain()
	    	$('<div id="timesdiv"><h3>All Times</h3></div>').appendTo('#body')
	    	populateTimeData({'dashboard': false, 'count': 'none'})
	    })	   	
	    $('#projectsBtn').on('click',function () {
	    	clearMain()
	    	$('<div id="timesdiv"><h3>All Projects</h3><button class="button4" id="newProjBtn">New Project</button></div>').appendTo('#body')
	    	populateProjects()

	    	$('#newProjBtn').on('click',function () {
				clearMain()
				buildDashboard(function () {projectPage('newProj')})
	    	})
	    })

	}
})()

function buildDashboard (fun) {
	$('<div class="flex border-bottom"><div class="flex2" id="dashboard1"></div><div class="flex3 border-left" id="dashboard2"></div></div>')
	.appendTo('#body')
	fun()
}

function clearMain () {
	$('#body >').remove()
}

function dashboard () {
	buildDashboard(function () {
		$('<div><button class="button4" id="">Recent Times</button><button class="button4 noBorder">Recent Projects</button></div>').appendTo('#body')
		$('<div id="timesdiv"></div>').appendTo('#body')
	    populateTimeData({'dashboard': true, 'count':5})
	})
}

function populateTimeData (options) {
	timesDB.allDocs({include_docs:true,descending:true},function (err, response) {
		if (err) { console.log(err);alert(Error); return}
		console.log(response)
		if (options.dashboard) {
			$('<h3>').text('Total Hours: ' + totalHours(response.rows)).appendTo('#dashboard1')
			$('<p>').text('Work Hours: ' ).addClass('left').appendTo('#dashboard1')
			$('<p>').text('Break Hours: ' ).addClass('left').appendTo('#dashboard1')
			$('<p>').text('Lunch Hours: ' ).addClass('left').appendTo('#dashboard1')
			$('<p>').text('Non-Work Hours: ' ).addClass('left').appendTo('#dashboard1')
		}
		//console.log(totalHours(response.rows))
		if (options.count == 'none') {
			options.count = response.rows.length
			console.log('options.count') 
		}
		for ( var i = 0; options.count > i ; i++) {
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

function populateProjects () {
	$('<div id="projdiv"></div>').appendTo('#body')
	projDB.allDocs({include_docs:true,descending:true},function (err, response) {
		if (err) { console.log(err);alert(Error); return}
		console.log(response)
		for ( var i = 0; response.rows.length > i ; i++) {
			$('<a>').css({'display':'block'}).attr('id',response.rows[i].doc._id).addClass('item2').appendTo('#projdiv')
			//$('<h5>').text('Hours: ' + totalHours([response.rows[i]])).css({'margin':'10px','margin-left':'2em','flex':'1'}).appendTo('#'+ response.rows[i].doc._id )
			//$('<h5>').text(response.rows[i].doc.type).css({'margin':'10px','margin-left':'2em','flex':'1'}).appendTo('#'+ response.rows[i].doc._id )
			$('<h5>').text('Name: ' + response.rows[i].doc.name).css({'margin':'10px','margin-left':'2em','flex':'2'}).appendTo('#'+ response.rows[i].doc._id )
			//$('<h5>').text('Project: ' + response.rows[i].doc.project).css({'margin':'10px','margin-left':'2em','flex':'2'}).appendTo('#'+ response.rows[i].doc._id )

			$('#'+ response.rows[i].doc._id).on('click',function () {
				clearMain()
				//console.log($(this).attr('id'))
				//projectPage($(this).attr('id'))
				buildDashboard(function () {})
				projectPage($(this).attr('id'))
			})
		}
	})	
}

function projectPage (project) {
	var projectData = {}
	$('#dashboard1').css({'text-align':'right'})
	$('<label>Name<input class="input" id="name"></input></label></br>').appendTo('#dashboard1')
	$('<label>Status<select class="input" id="status"><option>Active</option><option>Completed</option><option>Canceled</option></select></label></br>').appendTo('#dashboard1')	
	$('<label>Link<input class="input" id="link"></input></label></br>').appendTo('#dashboard1')
	$('<label>Contact<input class="input" id="contact"></input></label></br>').appendTo('#dashboard1')
	$('<label>Email<input class="input" id="email"></input></label></br>').appendTo('#dashboard1')
	$('<label>Phone<input class="input" id="phone"></input></label></br>').appendTo('#dashboard1')
	$('<button class="button4" id="saveBtn">Save</button>').appendTo('#dashboard2')
	$('<textarea id="text">').css({'width':'90%','margin-left':'5%','margin-top':'10px','margin-bottom':'10px','height':'135px'}).appendTo('#dashboard2')
	if (project != 'newProj') {
		projDB.get(project, function (err, response) {
			if (err) {console.log(err);return}
			projectData = response
			console.log(projectData)
			populate()
		})
	}

	$('#saveBtn').on('click',function () {
		console.log('Saving')
		var temp = getProjData(projectData)
		projDB.put(temp, function (err, response) {
			if (err) {console.log(err);return}
			console.log(response)
		})
	})

	function populate (){
		$('#name').val(projectData.name)
		$('#status').val(projectData.status)
		$('#link').val(projectData.link)
		$('#contact').val(projectData.contact)
		$('#email').val(projectData.email)
		$('#phone').val(projectData.phone)
		$('#text').val(projectData.text)
	}
} 

function getProjData (project) {
	project._id = ($('#name').val()).replace(" ", "")
	project.name = ($('#name').val()).trim()
	project.status = ($('#status').val()).trim()
	project.link = ($('#link').val()).trim()
	project.contact = ($('#contact').val()).trim()
	project.email = ($('#email').val()).trim()
	project.phone = ($('#phone').val()).trim()
	project.text = ($('#text').val()).trim()
	return project
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

timesDB.changes({since: 'now',
  live: true,
  include_docs: true}).on('change',function (change) {
  	console.log(change)
  })
