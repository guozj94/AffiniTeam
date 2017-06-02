$(document).ready(function() {
	var notesArray = [];
	var tagsArray = [];
	console.log(notesArray);
	var fileInput = document.getElementById("fileInput");
	fileInput.addEventListener("change", function(event) {
		var file = fileInput.files[0];
		var textType = /text.*/;
		if(file.type.match(textType)) {
			var reader = new FileReader();
			reader.onload = function(event) {
				
				var content = reader.result;
				var nlp = window.nlp_compromise;
				notesArray = content.split("\n");
				notesArray.pop();
				localStorage.setItem("note_nums", notesArray.length);
				console.log(localStorage.getItem("note_nums"));
				for(var i = 0; i < notesArray.length; i++) {
					localStorage.setItem("note" + i, notesArray[i]);
					var tag = {"verb": "", "noun": ""};
					var indexArrayOfVerb = [];
					var arrayOfVerb = [];
					var indexArrayOfNoun = -1;
					console.log(notesArray[i]);
					var adjustedNote = notesArray[i].replace(".", "");
					var word = adjustedNote.split(" ");
					var component = nlp.text(adjustedNote).tags()[0];
					if(component.indexOf("Noun") != -1) indexArrayOfNoun = component.indexOf("Noun");
					console.log(indexArrayOfVerb);
					tag.noun = word[indexArrayOfNoun];
					console.log(tag.noun);
			
					console.log(tag.verb);
					tagsArray.push(tag.noun);
					localStorage.setItem("tag" + i, tag.noun);
				}
				console.log(tagsArray);
				localStorage.setItem("note_tags", tagsArray);
			}
			reader.readAsText(file);
			setTimeout(function() {
				$("#selectnote").text("Uploaded!");
				localStorage.setItem("username", $("#user_name").val());
			}, 500);
		} else{
			alert("Invaild File. Please Upload .txt File.");
		}
	});
})

