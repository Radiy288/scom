function Start(){
	var navBar = document.createElement("nav");
	var logo = document.createElement("a");
	logo.innerHTML = '<img src="../../sccol_logo.png">';
	logo.href="/scom/docs/sccol/";
	var linkBasics = document.createElement("a");
	linkBasics.href="basics.html";
	linkBasics.className="option";
	linkBasics.style="margin: 0; padding: 2px;"
	linkBasics.innerHTML="<big>BASICS</big>";
	
	var linkCommands = document.createElement("p");
	linkCommands.className="option";
	linkCommands.style="padding: 2px;"
	linkCommands.onclick = function(){
		if(cmdNav.style.display == 'block'){
			cmdNav.style.display = 'none';
		}
		else{
			cmdNav.style.display = 'block';
		}
	};
	linkCommands.innerHTML="<small>▼</small><big>COMMANDS</big>";
	var cmdNav = document.createElement("div");
	cmdNav.id="commands";
	cmdNav.style="display: none";
	cmdNav.className="menu";
	
	var linkVariables = document.createElement("p");
	linkVariables.className="option";
	linkVariables.style="padding: 2px;"
	linkVariables.onclick = function(){
		if(conNav.style.display == 'block'){
			conNav.style.display = 'none';
		}
		else{
			conNav.style.display = 'block';
		}
	};
	linkVariables.innerHTML="<small>▼</small><big>VARIABLES</big>";
	var conNav = document.createElement("div");
	conNav.id="constants";
	conNav.style="display: none";
	conNav.className="menu";
	
	var linkOperators = document.createElement("p");
	linkOperators.className="option";
	linkOperators.style="padding: 2px;"
	linkOperators.onclick = function(){
		if(conOp.style.display == 'block'){
			conOp.style.display = 'none';
		}
		else{
			conOp.style.display = 'block';
		}
	};
	linkOperators.innerHTML="<small>▼</small><big>OPERATORS</big>";
	var conOp = document.createElement("div");
	conOp.id="operators";
	conOp.style="display: none";
	conOp.className="menu";
	conOp.innerHTML += '<a href="add.html" class="navlink option">+</a>';
	conOp.innerHTML += '<a href="subtract.html" class="navlink option">-</a>';
	conOp.innerHTML += '<a href="multiply.html" class="navlink option">*</a>';
	conOp.innerHTML += '<a href="divide.html" class="navlink option">/</a>';
	conOp.innerHTML += '<a href="modulo.html" class="navlink option">%</a>';
	conOp.innerHTML += '<a href="equal.html" class="navlink option">=</a>';
	conOp.innerHTML += '<a href="notequal.html" class="navlink option">!=</a>';
	conOp.innerHTML += '<a href="smaller.html" class="navlink option"><</a>';
	conOp.innerHTML += '<a href="greater.html" class="navlink option">></a>';
	conOp.innerHTML += '<a href="smallereq.html" class="navlink option">=<</a>';
	conOp.innerHTML += '<a href="greatereq.html" class="navlink option">=></a>';
	
	var linkExamples = document.createElement("a");
	linkExamples.href="examples.html";
	linkExamples.className="option";
	linkExamples.style="margin: 0; padding: 2px;"
	linkExamples.innerHTML="<big>EXAMPLES</big>";
	
	document.body.insertBefore(navBar, document.getElementsByClassName("main-container")[0]);
	navBar.className = "left-container";
	for (let c in commands){
		let cmdLink = document.createElement("a");
		cmdLink.innerText = c.toUpperCase();
		cmdLink.href = c+'.html';
		if(c == '//'){
			cmdLink.href = 'comment.html';
		}
		cmdLink.className = "navlink option";
		cmdNav.appendChild(cmdLink);
	}
	for (let i=0; i<constants.length; i++){
		let cmdLink = document.createElement("a");
		cmdLink.innerText = constants[i];
		cmdLink.href = constants[i].toLowerCase()+'.html';
		cmdLink.className = "navlink option";
		conNav.appendChild(cmdLink);
	}
	navBar.appendChild(logo);
	navBar.appendChild(document.createElement("hr"));
	navBar.appendChild(linkBasics);
	navBar.appendChild(document.createElement("hr"));
	navBar.appendChild(linkCommands);
	navBar.appendChild(cmdNav);
	navBar.appendChild(document.createElement("hr"));
	navBar.appendChild(linkVariables);
	navBar.appendChild(conNav);
	navBar.appendChild(document.createElement("hr"));
	navBar.appendChild(linkOperators);
	navBar.appendChild(conOp);
	navBar.appendChild(document.createElement("hr"));
	navBar.appendChild(linkExamples);
}