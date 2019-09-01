/* jshint strict:global */
/* jshint noempty:false */
/* jshint undef:true */
/* jshint browser:true */
/* jshint -W033 */
/* jshint -W069 */
/* global Howl */

'use strict';
var exams = [];
var mode = "edit";

function pad( n ) {
	var s = n.toString();
	while (s.length < 2) {
	   s = "0" + s;
	}
	return(s);
}

function displayTime() {
	var now = new Date();
	var h = now.getHours();
	var m = now.getMinutes();
	var sTimeNow = pad(h) + ":" + pad(m);
	if (now.getSeconds() % 2 == 0) {
		sTimeNow = pad(h) + " " + pad(m);
	}
	document.querySelector(".clock").innerHTML = sTimeNow;
}

function getTodayDateString() {
	let today = new Date();
	let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemnber"];
	let dateString = daysOfWeek[today.getDay()]+" "+today.getDate()+" "+months[today.getMonth()]+" "+today.getFullYear();
	return dateString;
}

function onEdit(e) {
	setMode("edit");
	let names = document.querySelectorAll('input[name="exam"]');
	let times = document.querySelectorAll('input[name="minutes"]');
	// Erase the text boxes current content
	for (let i=0; i<names.length; i++) {
		names[i].value = "";
		times[i].value = "0";
	}
	// Copy data from `exams` global into text boxes
	for (let i=0; i<exams.length; i++) {
		names[i].value = exams[i].name;
		times[i].value = Math.round(exams[i].seconds / 60);
	}
}

function onSave(e) {
	// Copy data from text boxes into `exams` global
	exams = [];
	let names = document.querySelectorAll('input[name="exam"]');
	let times = document.querySelectorAll('input[name="minutes"]');
	let display_names = document.querySelectorAll('.display_exam_name');
	let display_times = document.querySelectorAll('.display_exam_time');
	console.log(names);
	for (let i=0; i<names.length; i++) {
		console.log(i,names[i].value);
		if (names[i].value.length > 0) {
			exams.push( { 
				"name": names[i].value, 
				"seconds": 60*Number(times[i].value)
				} 
			);
		}
	}
	setMode("pause");
	console.log(exams);
}

function setMode(newMode) {
	mode = newMode; // save the new mode to the global. Will affect the tickTock function accordingly.
	let names = document.querySelectorAll('input[name="exam"]');
	let times = document.querySelectorAll('input[name="minutes"]');
	let display_names = document.querySelectorAll('.display_exam_name');
	let display_times = document.querySelectorAll('.display_exam_time');
	if (newMode == "edit") {
		document.querySelector("#edit").style.display = "none";
		document.querySelector("#save").style.display = "inline-block";
		document.querySelector("#share").style.display = "inline-block";
		document.querySelector("#play").style.display = "none";
		document.querySelector("#pause").style.display = "none";
		document.querySelector(".paused_modal").style.display = "none";
		document.querySelector(".share_modal").style.display = "none";
		for (let i=0; i<names.length; i++) {
			names[i].style.display = "inline-block";
			times[i].style.display = "inline-block";
			display_names[i].style.display = "none";
			display_times[i].style.display = "none";
		}
	} else if (newMode == "play") {
		document.querySelector("#edit").style.display = "none";
		document.querySelector("#save").style.display = "none";
		document.querySelector("#share").style.display = "none";
		document.querySelector("#play").style.display = "none";
		document.querySelector("#pause").style.display = "inline-block";
		document.querySelector(".paused_modal").style.display = "none";
		document.querySelector(".share_modal").style.display = "none";
		for (let i=0; i<names.length; i++) {
			names[i].style.display = "none";
			times[i].style.display = "none";
			display_names[i].style.display = "inline-block";
			display_times[i].style.display = "inline-block";
		}
	} else if (newMode == "pause") {
		document.querySelector("#edit").style.display = "inline-block";
		document.querySelector("#save").style.display = "none";
		document.querySelector("#share").style.display = "none";
		document.querySelector("#play").style.display = "inline-block";
		document.querySelector("#pause").style.display = "none";
		document.querySelector(".paused_modal").style.display = "block";
		document.querySelector(".share_modal").style.display = "none";
		for (let i=0; i<names.length; i++) {
			names[i].style.display = "none";
			times[i].style.display = "none";
			display_names[i].style.display = "inline-block";
			display_times[i].style.display = "inline-block";
		}
	} else if (newMode == "share") {
		document.querySelector(".share_modal").style.display = "block";
	}
}

function onShareClose(e) {
	setMode("edit");
}

function onShare(e) {
	onSave(null);
	setMode("share");
	let url = location.hostname+"?load="+encodeURI(JSON.stringify(exams));
	document.querySelector(".share_info").value = url;
	document.querySelector("#share_close").onclick = onShareClose;
}

function onPlay(e) {
	setMode("play");
}

function onPause(e) {
	setMode("pause");
}

function tickTock(e) { // executes once every second
	if (mode == "play") {
		// Deduct one second off every exam
		for (let i=0; i<exams.length; i++) {
			if (exams[i].seconds > 0) {
				exams[i].seconds--;
			}
		}
	}
	if (mode == "play" || mode == "pause") {
		// Display updated time remaining data
		let now = new Date();
		let display_names = document.querySelectorAll('.display_exam_name');
		let display_times = document.querySelectorAll('.display_exam_time');
		let display_finishes = document.querySelectorAll('.display_finish_time');
		for (let i=0; i<exams.length; i++) {
			// Calculate hours and minutes remaining in this exam
			let h = Math.trunc(exams[i].seconds / 3600);
			let m = Math.trunc(exams[i].seconds / 60) - h*60;
			// If there is 1 to 59 seconds, we want it to display 1 minute remaining. ie: only show 0 when we are finished. This will ROUND UP the minutes remaining
			if (exams[i].seconds % 60 !== 0) {
				m++;
			}
			let display_time = pad(h)+":"+pad(m);
			// Determine any "warnings" that need to be displayed for this exam
			if (exams[i].seconds == 0) {
				if (! display_times[i].classList.contains("finished")) {
					display_times[i].classList.add("finished");
				}
			} else if (exams[i].seconds <= 5*60) {
				if (! display_times[i].classList.contains("less_than_5")) {
					display_times[i].classList.add("less_than_5");
				}
			} else if (exams[i].seconds <= 30*60) {
				if (! display_times[i].classList.contains("less_than_30")) {
					display_times[i].classList.add("less_than_30");
				}
			}
			// Calculate the finishing time for this exam
			let finish_time = new Date( now.getTime() + exams[i].seconds*1000);
			let finish_h = finish_time.getHours();
			let finish_m = finish_time.getMinutes();
			let finish_time_str = pad(finish_h) + ":" + pad(finish_m);
			// Update the HTML with the info for this exam
			display_names[i].innerHTML = exams[i].name;
			display_times[i].innerHTML = display_time;
			display_finishes[i].innerHTML = finish_time_str;
		}
	}
	console.log(mode, JSON.stringify(exams));
}

function main() {
	// Have we received any data via the URL query string? If so, load it.
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has("load")) {
		const myData = decodeURI(urlParams.get('load'));
		console.log("Found the ?load= query string, importing data...");
		exams = JSON.parse(myData);
		console.log("Data imported = ",myData);
	}
	// Get our event handlers
	document.querySelector(".title_text").innerHTML = getTodayDateString();
	document.querySelector("#edit").onclick = onEdit;
	document.querySelector("#save").onclick = onSave;
	document.querySelector("#share").onclick = onShare;
	document.querySelector("#play").onclick = onPlay;
	document.querySelector("#pause").onclick = onPause;
	// Start the clocks
	setInterval( displayTime, 1000 );
	setInterval( tickTock, 1000 );
	// We start in edit mode and displaying the edit screen
	setMode("edit");
	onEdit();
}

window.onload = main;

