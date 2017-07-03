"use strict";

console.log('renderer script')

const {remote} = require('electron')
const {Menu, MenuItem} = remote

let remoteData = require('electron').remote.getGlobal('remoteData')

let timerInterval
let timers=[]
let timer


function timerFunc (action) {
	//console.log('timer')
	if (action == 'start') {
		timer = {}
		timer.start = new Date();
		if (timer.start.getHours() > 12) {
			var hours = timer.start.getHours() - 12
			var amPm = " PM"
		}else{
			var hours = timer.start.getHours() 
			var amPm = " AM"		
		}
		if (timer.start.getMinutes() < 10) {
			$($('.little')[0]).text("Start Time: " + hours + ":0" + timer.start.getMinutes() + 	amPm).css('text-align','center')
		}else{
			$($('.little')[0]).text("Start Time: " + hours + ":" + timer.start.getMinutes() + 	amPm).css('text-align','center')
		}
		$($('.little')[1]).text("")
		timerInterval = setInterval(function () {
			var timeMsec = Date.now() - timer.start.getTime()
			var sec = function (time) {
				var m
				if (time / 1000 > 59) {
					m = parseInt(time / 1000) - (parseInt(time /1000/60) *60)
				}else{
					m = parseInt(time / 1000)
				}
				if (m<10) {
					m = "0" + m 
				}
				return(m)
			}
			var min = function (time) {
				var m
				if (time / 60000 > 59) {
					m = parseInt(time / 60000) - (parseInt(time /60000/60) *60)
				}else{
					m = parseInt(time / 60000)
				}
				if (m<10) {
					m = "0" + m 
				}
				if (m == 0) {
					m = "00"
				}
				return(m)
			}
			var hour = function (time) {
				var m
				if (time / 3600000 > 59) {
					m = parseInt(time / 3600000) - (parseInt(time /3600000/60) *60)
				}else{
					m = parseInt(time / 3600000)
				}
				if (m<10) {
					m = "0" + m 
				}
				if (m == 0) {
					m = "00"
				}
				return(m)
			}
			$('.big').css({'font-size': '3em','margin': 0}).text(hour(timeMsec) + ":" + min(timeMsec)+ ":" + sec(timeMsec))
		}, 500)
	}else if (action == 'stop') {
		clearInterval(timerInterval)
		timer.stop = new Date();

		timer.name = $('input').val()
		
		timers.push(timer)
		console.log(timers)

		if (timer.stop.getHours() > 12) {
			var hours = timer.stop.getHours() - 12
			var amPm = " PM"
		}else{
			var hours = timer.stop.getHours() 
			var amPm = " AM"		
		}
		if (timer.stop.getMinutes() < 10) {
			$($('.little')[1]).text("Stop Time: " + hours + ":0" + timer.stop.getMinutes() + 	amPm).css('text-align','center')
		}else{
			$($('.little')[1]).text("Stop Time: " + hours + ":" + timer.stop.getMinutes() + 	amPm).css('text-align','center')
		}

	}
}


$('#start').on('click',function () {
	if ($('#start').text() == 'START') {
		timerFunc('start')
		$('#start').text('STOP')
	}else if ($('#start').text() == 'STOP') {
		timerFunc('stop')
		$('#start').text('START')
	}
})

$('#save').on('click',function () {
	remoteData(timers)
})

const menu = new Menu()
menu.append(new MenuItem({label: 'MenuItem1', click() { console.log('item 1 clicked') }}))
menu.append(new MenuItem({type: 'separator'}))
menu.append(new MenuItem({label: 'WindowFrame', type: 'checkbox', checked: true}))

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  menu.popup(remote.getCurrentWindow())
}, false)