var note1ID = []; //noteID created on the host page
var note2ID = []; //noteID created on client page
var noteText = [];
var deleteBtn = [];
var focusNote = null;
var boxSize = {"width": 0, "height": 0};
var notesArray = [];
var tagsArray = [];
var viewBoxWidth = 0;
var viewBoxHeight = 0;
var viewBoxX = 0;
var viewBoxY = 0;
/*
* function break the text into different rows to fit the note
* @param text text that need to be break down
* @return returnObj the object of broken text, consisting the content and the amount of rows
*/
function breakLine(text) {
	var countLetter = 0;
    var countRow = 1;
    var newText = [];
    var returnObj = null;
	var allWords = text.split(" ");
	for(var i in allWords) {
		if(countLetter + allWords[i].length < 24) {
            countLetter = countLetter + allWords[i].length + 1;
            newText = newText + allWords[i] + " ";
        }
        else {
            countLetter = allWords[i].length;
            countRow ++;
            newText = newText + "\n" + allWords[i] + " ";
        }
	}
    returnObj = {"text": newText, "row": countRow};
    return returnObj;
}


/*
* function enables all operations on affinity notes including creating, dragging, and removing
* @param raphaelName the Raphael paper that you work on
* @param xPos the x coordinate where you want to create the note
* @param yPos the y coordinate where you want to create the note
* @param noteColor the color of the note you will create.
* @param text the raw text of the note
* @return note1 the note object you created.
*/
function controlNote(raphaelName, xPos, yPos, noteColor, text) {
    var noteText = breakLine(text);
    var currentNotePosition = {"x": 0, "y": 0};
    var currentContentPosition = {"x": 0, "y": 0};
    var currentDeletePosition = {"x": 0, "y": 0};
    var colorCodec = null, strokeCodec = null;

    if(noteColor == "white") {colorCodec = "rgb(255, 255, 255)"; strokeCodec = "rgb(0, 0, 0)";}
    if(noteColor == "Blue") {colorCodec = "#8deeee"; strokeCodec = "#8deeee";}
    if(noteColor == "Pink") {colorCodec = "#ffc0cb"; strokeCodec = "#ffc0cb";}
    if(noteColor == "Green") {colorCodec = "#98fb98"; strokeCodec = "#98fb98";}

    var noteWidth = 200;
    var noteHeight = function() { 
        if(noteText.row * 24 < 160) return 160;
        else return noteText.row * 24;
    }

    var note1 = raphaelName.rect(xPos, yPos, 200, 20 * (noteText.row + 1)).attr({
        fill: colorCodec,
        stroke: strokeCodec,
        opacity: .5,
        cursor: "move"
    });

    var text = raphaelName.text(xPos + 100, yPos + noteText.row * 10, noteText.text).attr({
        fill: '#000000',
        'font-size': 16,
        'font-family': "Lato,Helvetica,Arial,sans-serif",
        'font-weight': 300
    });

    var deleteButton = raphaelName.text(xPos + 25, yPos + 20 * (noteText.row + 1) - 10, "Delete").attr({
        fill: '#000000',
        'font-family': "Lato,Helvetica,Arial,sans-serif",
        'font-weight': 300,
        'font-size': 14,
    });

    var start = function() {
        this.ox = this.attr("x");
        this.oy = this.attr("y");
        this.attr({opacity: 1});
        this.content.ox = this.content.attr("x");
        this.content.oy = this.content.attr("y");
        this.deleteButton.ox = this.deleteButton.attr("x");
        this.deleteButton.oy = this.deleteButton.attr("y");
    }

    var move = function(dx, dy) {
        this.attr({
            x: this.ox + dx*viewBoxWidth/1050, 
            y: this.oy + dy*viewBoxHeight/700
        });
        this.content.attr({
            x: this.content.ox + dx*viewBoxWidth/1050, 
            y: this.content.oy + dy*viewBoxHeight/700
        });
        this.deleteButton.attr({
            x: this.deleteButton.ox + dx*viewBoxWidth/1050, 
            y: this.deleteButton.oy + dy*viewBoxHeight/700
        });
    }

    var up = function() {
        currentNotePosition.x = this.attr("x");
        currentNotePosition.y = this.attr("y");
        currentContentPosition.x = this.content.attr("x");
        currentContentPosition.y = this.content.attr("y");
        currentDeletePosition.x = this.deleteButton.attr("x");
        currentDeletePosition.y = this.deleteButton.attr("y");

        this.attr({opacity: 0.5});
        this.content.attr({opacity: 1});
        if(TogetherJS.running) {
            console.log("TogetherJS Sent!");
            TogetherJS.send({
                type: "movenote",
                finalPositionX: currentNotePosition.x,
                finalPositionY: currentNotePosition.y,
                ID: note1.id,
                finalContentPositionX: currentContentPosition.x,
                finalContentPositionY: currentContentPosition.y,
                finalDeletePositionX: currentDeletePosition.x,
                finalDeletePositionY: currentDeletePosition.y
            });
        }
    }

    note1.content = text;
    note1.deleteButton = deleteButton;
    note1.color = noteColor;
    note1.drag(move, start, up);

    note1.deleteButton.click(function() {
        var noteX = note1.getBBox().x;
        var noteY = note1.getBBox().y;
        note1.animate({
            x: note1.getBBox().x + viewBoxWidth, 
            y: 350}, 800, "easeInOut");
        note1.content.animate({
            x: 100 + note1.content.getBBox().x + viewBoxWidth, 
            y: 350}, 800, "easeInOut");
        note1.deleteButton.animate({
            x: note1.deleteButton.getBBox().x + viewBoxWidth, 
            y: 350}, 800, "easeInOut");
        if(TogetherJS.running) {
            console.log("TogetherJS Sent!");
            TogetherJS.send({
                type: "removenote",
                text: noteText.text,
                ID: note1.id
            });
        }
        remove(raphaelName, noteText.text, note1);      
    });
    return note1;
}

function pushNote(note) {
    note1ID.push(note.id);
}

/*
* function remove the selected note
* @param raphaelName the Raphael paper that you work on
* @param text the text on the removing note
* @param note the note object that need to be removed
* @return NaN
*/
function remove(raphaelName, text, note) {
    if(note.color != "white") {
        note.content.remove();
        note.deleteButton.remove();
        note.remove();
    }
    else {
        setTimeout(function() {
            $(".notes").append("<div class='note'><div class='notetext'>" + text + "</div><div class='notecontrol'><div class='highlight'>Highlight</div><div class='addtocanvas'>Add to Canvas</div><div class='deletenote'>Delete</div></div></div>");
            $(".highlight").off("click");
            $(".addtocanvas").off("click");
            $(".deletenote").off("click");
            createGlobalEventListener(raphaelName);
            note.content.remove();
            note.deleteButton.remove();
            note.remove();
        }, 810);
    }
}

/*
* function generates html note element and lists them in note container.
* @param number_of_note the number of notes 
* @param notesArray the array of all the notes
* @return NaN
*/
function createNote(number_of_note, notesArray, tagsArray) {
    for(var i = 0; i < number_of_note; i++) {
        $(".notes").append("<div class='note'><div class='notetext'>" + notesArray[i] + "</div><div class='notetag'>#" + tagsArray[i] + "</div><div class='notecontrol'><div class='highlight'>Highlight</div><div class='addtocanvas'>Add to Canvas</div><div class='deletenote'>Delete</div></div></div>");
    }
}


/*
* function add eventlisteners to all clickable elements in the note container in all pages
* @param R the Raphael paper that you work on
* @return note1 the note object you created.
*/
function createGlobalEventListener(R) {
    var flag = false;

    //highlight eventlistener
    $(".highlight").click(function() {
        if(flag == true) {
            $(this).parent().parent().css({"font-weight": "300"});
            $(this).text("Highlight");
            flag = false;
            var text = $(this).parent().parent().find(".notetext").text();
            if(TogetherJS.running) {
                TogetherJS.send({
                    type: "unhighlightnote",
                    text: text
                });
            }
        }
        else {
            console.log("false");
            $(this).parent().parent().css({"font-weight": "700"});
            $(this).text("Unhighlight");
            flag = true;
            var text = $(this).parent().parent().find(".notetext").text();
            if(TogetherJS.running) {
                TogetherJS.send({
                    type: "highlightnote",
                    text: text
                });
            }
        }            
    });

    //delete eventlistener
    $(".deletenote").click(function() {
        var text = $(this).parent().parent().find(".notetext").text();
        $(this).parent().parent().remove();
        if(TogetherJS.running) {
            TogetherJS.send({
                type: "deletenote",
                text: text
            });
        }
    });

    //add note to canvas eventlistener
    $(".addtocanvas").click(function() {
        var text = $(this).parent().parent().find(".notetext").text();
        var note = controlNote(R, 400, 300, "white", text);
        pushNote(note);
        console.log(note1ID);
        var jsonDecycle = JSON.decycle({'type': 'createTile', 'myRaphael': R, 'xPos': 400, 'yPos': 300});
        
        if(TogetherJS.running) {
            TogetherJS.send({
                type: "controlNote",
                xPos: 400,
                yPos: 300,
                noteColor: "white",
                text: text,
                ID: note.id
            });

            console.log("TogetherJS Sent!");
        }
        $(this).parent().parent().remove();
    });
}


/*
* function adds user-created notes to the canvas
* @param raphaelName the Raphael paper that you work on
* @return NaN
*/
function addNewNote(raphaelName) {
    var color = "white";
    var text = " ";

    //find color selected
    $(".dropdown-menu li").click(function() {
        color = $(this).text();
        $("#dropdownbtn").text(color);
        if(color == "Pink") $("#dropdownbtn").css({"background-color": "#ffc0cb"});
        if(color == "Blue") $("#dropdownbtn").css({"background-color": "#8deeee"});
        if(color == "Green") $("#dropdownbtn").css({"background-color": "#98fb98"});
    });

    //add note to the canvas and send message to all pages
    $(".addnotebutton").click(function() {
        text = $("#newnoteinput").val();
        var note = controlNote(raphaelName, 400, 300, color, text);
        pushNote(note);

        if(TogetherJS.running) {
            TogetherJS.send({
                type: "controlNote",
                xPos: 400,
                yPos: 300,
                noteColor: color,
                text: text,
                ID: note.id
            });
        }

        $("#dropdownbtn").text("Note Color");
        $("#dropdownbtn").css({"background-color": "rgb(249, 211, 140)"});
        $("#newnoteinput").val("");
        text = " ";
        color = "white";
    });
}


window.onload = function() {
    //create welcome information
    var username = localStorage.getItem("username");
    if(username == null) username = "You";
    $("#username").text("Hi, "+username);

    //load notes
    var noteNumber = localStorage.getItem("note_nums");
    for(var i = 0; i < noteNumber; i++) {
        notesArray.push(localStorage.getItem("note"+i));
    }
    for(var j = 0; j < noteNumber; j++) {
        tagsArray.push(localStorage.getItem("tag"+j));
        console.log(localStorage.getItem("tag"+j));
    }
    console.log(notesArray);

    //create all element in notes container
    createNote(noteNumber, notesArray, tagsArray);

    //create Raphael paper
    var R = Raphael("canvas", 1050, 700);

    //add eventlisteners to all pages in collaboration
    createGlobalEventListener(R);

    //add new user-created note
    addNewNote(R);

    //start teamwork
    setTimeout(function() {
        if(TogetherJS.running) $("#teamwork").text("End Teamwork");
    }, 200);
    $("#teamwork").click(function() {
        if($(this).text() == "Start Teamwork") $(this).text("End Teamwork");
        else $(this).text("Start Teamwork");
    });

    //create note element on all other pages
    TogetherJS.hub.on("controlNote", function(msg) {
        if(!msg.sameUrl) return;
        var temp = controlNote(R, msg.xPos, msg.yPos, msg.noteColor, msg.text);
        $(".notetext:contains("+msg.text+")").parent().remove();
        note1ID.push(msg.ID);
        note2ID.push(temp.id);
        if(TogetherJS.running) {
            TogetherJS.send({
                type: "returnnoteid",
                ID: temp.id
            });
        }
        console.log(note1ID);
        console.log(note2ID);
    });

    //return the id of notes created on other pages
    TogetherJS.hub.on("returnnoteid", function(msg) {
        if(!msg.sameUrl) return;
        note2ID.push(msg.ID);
    });

    //move the note on all other pages
    TogetherJS.hub.on("movenote", function(msg) {
        if(!msg.sameUrl) return;
        var index = -1;
        var dragNote = null;
        console.log("note1iD: ", note1ID);
        console.log("note2iD: ", note2ID);
        if(note1ID.indexOf(msg.ID) != -1) {
            index = note1ID.indexOf(msg.ID);
            var noteID = note2ID[index];
            //console.log(index);
            dragNote = R.getById(noteID);
            dragNote.attr({
                x: msg.finalPositionX, 
                y: msg.finalPositionY
            });
            dragNote.content.attr({
                x: msg.finalContentPositionX, 
                y: msg.finalContentPositionY
            });
            dragNote.deleteButton.attr({
                x: msg.finalDeletePositionX,
                y: msg.finalDeletePositionY
            });
        }
        if(note2ID.indexOf(msg.ID) != -1) {
            index = note2ID.indexOf(msg.ID);
            var noteID = note1ID[index];
            //console.log(index);
            dragNote = R.getById(noteID);
            dragNote.attr({
                x: msg.finalPositionX, 
                y: msg.finalPositionY
            });
            dragNote.content.attr({
                x: msg.finalContentPositionX, 
                y: msg.finalContentPositionY
            });
            dragNote.deleteButton.attr({
                x: msg.finalDeletePositionX,
                y: msg.finalDeletePositionY
            });
        }
    });

    //remove the note on all other pages
    TogetherJS.hub.on("removenote", function(msg) {
        if(!msg.sameUrl) return;
        var index = -1;
        var removeNoteNote = null;
        if(note1ID.indexOf(msg.ID) != -1) {
            index = note1ID.indexOf(msg.ID);
            var noteID = note2ID[index];
            removeNote = R.getById(noteID);
            removeNote.animate({
                x: removeNote.getBBox().x + viewBoxWidth, 
                y: 350}, 800, "easeInOut");
            removeNote.content.animate({
                x: 100 + removeNote.content.getBBox().x + viewBoxWidth, 
                y: 350}, 800, "easeInOut");
            removeNote.deleteButton.animate({
                x: removeNote.deleteButton.getBBox().x + viewBoxWidth, 
                y: 350}, 800, "easeInOut");
            remove(R, msg.text, removeNote);
        }
        if(note2ID.indexOf(msg.ID) != -1) {
            index = note2ID.indexOf(msg.ID);
            var noteID = note1ID[index];
            //console.log(index);
            dragNote = R.getById(noteID);
            removeNote = R.getById(noteID);
            removeNote.animate({
                x: removeNote.getBBox().x + viewBoxWidth, 
                y: 350}, 800, "easeInOut");
            removeNote.content.animate({
                x: 100 + removeNote.content.getBBox().x + viewBoxWidth, 
                y: 350}, 800, "easeInOut");
            removeNote.deleteButton.animate({
                x: removeNote.deleteButton.getBBox().x + viewBoxWidth, 
                y: 350}, 800, "easeInOut");
            remove(R, msg.text, removeNote);
        }
    });

    //delete note in note container on all other pages
    TogetherJS.hub.on("deletenote", function(msg) {
        if(!msg.sameUrl) return;
        $(".notetext:contains("+msg.text+")").parent().remove();
    });

    //unhighlight note in note container on all other pages
    TogetherJS.hub.on("unhighlightnote", function(msg) {
        if(!msg.sameUrl) return;
        $(".notetext:contains("+msg.text+")").parent().css({"font-weight": "300"});
        $(".notetext:contains("+msg.text+")").parent().find(".highlight").text("Highlight");
    });

    //highlight note in note container on all other pages
    TogetherJS.hub.on("highlightnote", function(msg) {
        if(!msg.sameUrl) return;
        $(".notetext:contains("+msg.text+")").parent().css({"font-weight": "700"});
        $(".notetext:contains("+msg.text+")").parent().find(".highlight").text("Unhighlight");
    });

	var myCanvasDiv = document.getElementById("canvas");

	//start zoom canvas
	R.setViewBox(0, 0, R.width, R.height);
    viewBoxWidth = R.width;
    viewBoxHeight = R.height;
	var canvasID = "#canvas";
	var startX = 0,startY = 0;
	var mousedown = false;
	var dX = 0,dY = 0;
	var oX = 0, oY = 0, oWidth = viewBoxWidth, oHeight = viewBoxHeight;
	var viewBox = R.setViewBox(oX, oY, viewBoxWidth, viewBoxHeight);
    viewBox = R.setViewBox(oX, oY, viewBoxWidth, viewBoxHeight);
	viewBox.X = oX;
	viewBox.Y = oY;

    //handle zoom
	function handle(delta) {
        vBHo = viewBoxHeight;
        vBWo = viewBoxWidth;
        if (delta < 0) {
        	viewBoxWidth *= 0.95;
        	viewBoxHeight *= 0.95;
        	boxSize.width = viewBoxWidth;
        }
        else {
        	viewBoxWidth *= 1.05;
        	viewBoxHeight *= 1.05;
        	boxSize.height = viewBoxHeight;
        }
                        
  	    viewBox.X -= (viewBoxWidth - vBWo) / 2;
  	    viewBox.Y -= (viewBoxHeight - vBHo) / 2;
        viewBoxX = viewBox.X;
        viewBoxY = viewBox.Y;

  	    R.setViewBox(viewBox.X,viewBox.Y,viewBoxWidth,viewBoxHeight);
    }

    function wheel(event){
        var delta = 0;
        if (!event) 
            event = window.event;
        if (event.wheelDelta) { 
            delta = event.wheelDelta/120;
        } else if (event.detail) { 
            delta = -event.detail/3;
        }

        if (delta) handle(delta);

        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
    }

    //add eventlistener to canvas div
    if (myCanvasDiv.addEventListener) myCanvasDiv.addEventListener('DOMMouseScroll', wheel, false);
    myCanvasDiv.onmousewheel = wheel;
    //end zoom canvas

    //start drag canvas
    $("#canvas").mousedown(function(event){
        console.log(R.getElementByPoint(event.clientX, event.clientY));
    	if(R.getElementByPoint(event.clientX, event.clientY) != null) return;
    	mousedown = true;
    	startX = event.pageX;
    	startY = event.pageY;
    });

    $("#canvas").mousemove(function(event){
    	if(mousedown == false) return;
    	dX = startX - event.pageX;
    	dY = startY - event.pageY;
    	x = viewBoxWidth / R.width;
    	y = viewBoxHeight / R.height;
    	dX *= x;
    	dY *= y;
        var temp1 = viewBox.X + dX;
        var temp2 = viewBox.Y + dY;
        viewBoxX = temp1;
        viewBoxY = temp2;
    	R.setViewBox(viewBox.X + dX, viewBox.Y + dY, viewBoxWidth, viewBoxHeight);
    });

    $("#canvas").mouseup(function(event){
    	if(mousedown == false) return;
    	viewBox.X += dX;
    	viewBox.Y += dY;
    	mousedown = false;
    	focusNote = null;
    });
}
