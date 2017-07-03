"use strict";

console.log('renderer 2 script')

require('electron').ipcRenderer.on('displayTimes', function (event, data) {
	//console.log(event)
	//console.log(data)
	displayTimes(data)
})

const {remote} = require('electron')
const {Menu, MenuItem} = remote

let saveDB = require('electron').remote.getGlobal('saveDB')

const menu = new Menu()
menu.append(new MenuItem({label: 'To Database', click() { saveDB(entries) }}))
menu.append(new MenuItem({type: 'separator'}))
menu.append(new MenuItem({label: 'To CSV File', click() { console.log('item 1 clicked') }}))

let entries = []

function displayTimes (data) {

	function setData () {
		for (var i = 0; data.length > i; i++ ) {

			var temp = {}
			temp.name = data[i].name
			temp.type = "Work"
			temp.times = []
			temp.status = "active"
			var time = {
				"start":new Date(data[i].start),
				"stop":new Date(data[i].stop)
			}
	        temp.times.push(time)
	        entries.push(temp)
	    }
	}

	function displayData () {
		for (var i = 0; entries.length > i; i++){
			if ( entries[i].status == "active") {
				$('<div>').attr('id',i).addClass('item').appendTo('#body')
				$('<div>').attr('id',i + "check").addClass('checkDiv').appendTo('#'+ i)
				$('<input type="checkbox">').addClass('margin-top').appendTo('#'+ i + 'check')
				$('<div>').attr('id',i + "info").addClass('info').appendTo('#'+ i)
				$('<label>Name<input class="name"></label>').appendTo('#'+ i + 'info')
				$('#'+ i +'info > label > .name').val(entries[i].name)
				$('<label>Type<select class="margin-top type"><option>Work</option><option>Break</option><option>Lunch</option><option>Non-work</option></select></label>').addClass('margin-top').appendTo('#'+ i + 'info')		
				$('#'+ i + 'info > label > select').val(entries[i].type)
				$('<div>').attr('id',i + "time").addClass('time').appendTo('#'+ i)
				var totalHrs = 0
				for ( var ii = 0; entries[i].times[ii]; ii++) {
					totalHrs = (totalHrs + entries[i].times[ii].stop.getTime() - entries[i].times[ii].start.getTime()) 
				}
				console.log(totalHrs/3600000)
				console.log((totalHrs/36000) - Math.floor(totalHrs/36000))
				if((totalHrs/36000) - Math.floor(totalHrs/36000) <.5) {

					totalHrs = Math.floor(totalHrs / 36000) /100
					console.log('total hours Math floor')
				}else{
					totalHrs = Math.ceil(totalHrs / 36000) /100
					console.log('total hours Math ceil')
				}
				$('<h3>').text("Total Hours: " + totalHrs ).appendTo('#'+ i + "time")
				for ( var ii = 0; entries[i].times[ii]; ii++) {
					$('<p>').text("Start time: " + entries[i].times[ii].start).appendTo('#'+ i + "time")
					$('<p>').text("Stop time: " + entries[i].times[ii].stop).appendTo('#'+ i + "time")
				}
			}
		}	
		$('.name').on('blur',function () {
			var id = $($(this).parents()[2]).attr('id')
			entries[id].name = $(this).val()
			console.log(entries[id])
		})

		$('.type').on('blur',function () {
			var id = $($(this).parents()[2]).attr('id')
			entries[id].type = $(this).val()
			console.log(entries[id])
		})

	}

	function combine (items) {
		//test if have at least 2 items 
		if (items.length == 1) {
// ***add a message box
			console.log("Need to select At least two Items to combine")
			return
		}
		// test if items names match 
		for ( var i = 1; items.length > i ; i++) {
			if ( entries[items[0]].name != entries[items[i]].name ) {
//  ***add a message box
				console.log("Names of Items being Combined need to match")
				return
			}
		}
		for ( var i = 1; items.length > i ; i++) {
			for (var ii = 0; entries[items[i]].times.length > ii; ii++) {
				entries[items[0]].times.push(entries[items[i]].times[ii])
			}
			entries[items[i]].status = "combined"
		}
		//console.log(entries)
		clearDisplay()
		displayData()
	}

	function markDeleted (items) {
		var deleted
		for ( var i = 0; items.length > i ; i++) {
			entries[items[i]].status = "deleted"
		}
		clearDisplay()
		displayData()	
	}

	function clearDisplay () {
		$('.item').remove()
		$('.name').off('blur')
	}

	setData()
	displayData()
	//console.log(entries)

	$('#Combine').on('click',function () {
		var checked = []
		for ( var i = 0 ; $('.checkDiv > input').length > i ; i++) {
			if ($('.checkDiv > input')[i].checked) {
				var id = $($($('.checkDiv > input')[i]).parents()[1]).attr('id')
				checked.push(id)
			}
		}
		//console.log(checked)
		combine(checked)
	})

	$('#Delete').on('click',function () {
		var checked = []
		for ( var i = 0 ; $('.checkDiv > input').length > i ; i++) {
			if ($('.checkDiv > input')[i].checked) {
				var id = $($($('.checkDiv > input')[i]).parents()[1]).attr('id')
				checked.push(id)
			}
		}
		//console.log(checked)
		markDeleted(checked)
	})

	$('#Save').on('click',function () {
		menu.popup(remote.getCurrentWindow(),{x:127,y:37})
	})

} 