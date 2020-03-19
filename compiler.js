var buffer = [];
var context = new AudioContext();
var channelBuffer = [context.createOscillator(), context.createOscillator(), context.createOscillator(), context.createOscillator(), context.createOscillator(), context.createOscillator()]; //0, 1 - SQUARE, 2 - SINE, 3 - TRIANGLE, 4 - SAWTOOTH, 5 - NOISE;
var gainBuffer = [context.createGain(), context.createGain(), context.createGain(), context.createGain(), context.createGain(), context.createGain()];
var functions = {};
var openedFunction;
var paused = false;
var js = false;
var lastKey = 0;
var inputString = "";

window.addEventListener('keydown',function(event){
	lastKey = event.keyCode;
	inputString = consoleInput.value;
	if(event.keyCode === 13){
		if(!event.shiftKey){
			inputString = "";
		}
	}
	//console.log(lastKey);
},false);
window.addEventListener('keyup',function(event){
	lastKey = 0;
},false);

async function CompileBatch(str){
	if(js){
		str = str.replace(/SCCOL\;/g, 'js = false;');
		str = str.replace(/sccol\;/g, 'js = false;');
		eval(str);
	}
	else{
		str = str.replace(/\\\;/g, '||SEMICOLON||');
		let cmds = str.split(';');
		Input(false);
		/*
		cmds.forEach(async function(item){
			for(let i=0; i<item.length; i++){
				if(item.charAt(i) == ' ' || item.charAt(i) == '\n' || item.charAt(i) == '	'){
					//console.log("Fooound ooone");
				}
				else{
					item = item.substring(i);
					break;
				}
				//console.log("I'm checkin for pestilence");
			}
			if(openedFunction){
				if(item.toLowerCase() == 'end'){
					openedFunction = "";
				}
				else{
					functions[openedFunction] += item+';';
					console.log(item+';');
				}
			}
			else{
				await Compile(item);
			}
		});*/
		for(let index=0; index<cmds.length; index++){
			if(await CleanCompile(cmds[index]) == "STOP"){
				Input(true);
				return;
			};
		}
		//console.log("DONE");
		Input(true);
	}
}
async function CleanCompile(str){
	for(let i=0; i<str.length; i++){
		if(str.charAt(i) == ' ' || str.charAt(i) == '\n' || str.charAt(i) == '	'){
			//console.log("Fooound ooone");
		}
		else{
			str = str.substring(i);
			break;
		}
		//console.log("I'm checkin for pestilence");
	}
	if(openedFunction){
		if(str.toLowerCase() == 'end'){
			openedFunction = "";
			return true;
		}
		else{
			functions[openedFunction] += str+';';
			//console.log(str+';');
		}
	}
	else{
		if(str.toLowerCase() == 'end'){
			return "STOP";
		}
		await Compile(str);
	}
	return true;
}
function CheckPause(){
	if (!paused){
		return;
	}
	else{
		console.log("WAITING");
		setTimeout(CheckPause, 1);
	}
}
async function Compile(str){
	str = str.replace(/\|\|SEMICOLON\|\|/g, ';');
	
	//RANDOM NUMBER PARSING
	let constCount;
	constCount = (str.match(/(\%\^D2R)/g) || []).length;
	for(let i=0; i<constCount; i++){
		str = str.replace("%^D2R", 0.0174532924);
	}
	constCount = (str.match(/(\%\^R2D)/g) || []).length;
	for(let i=0; i<constCount; i++){
		str = str.replace("%^R2D", 57.29578);
	}
	constCount = (str.match(/(\%\^PI)/g) || []).length;
	for(let i=0; i<constCount; i++){
		str = str.replace("%^PI", Math.PI);
	}
	constCount = (str.match(/(\%\^R)/g) || []).length;
	for(let i=0; i<constCount; i++){
		str = str.replace("%^R", Math.random());
	}
	
	//VARIABLE BY VARIABLE VALUE PARSING
	let varCount = (str.match(/(\%\^\^)/g) || []).length;
	for(let i=0; i<varCount; i++){
		let prs="";
		for(let j=str.indexOf("%^^")+3; j<str.length; j++){
			if(isNaN(str.charAt(j)) || str.charAt(j) == ' '){
				break;
			}
			prs+=str.charAt(j);
		}
		str = str.replace("%^^"+prs, buffer[buffer[parseInt(prs)]]);
	}
	
	//VARIABLE PARSING
	varCount = (str.match(/(\%\^)/g) || []).length;
	for(let i=0; i<varCount; i++){
		let prs="";
		for(let j=str.indexOf("%^")+2; j<str.length; j++){
			if(isNaN(str.charAt(j)) || str.charAt(j) == ' '){
				break;
			}
			prs+=str.charAt(j);
		}
		str = str.replace("%^"+prs, buffer[parseInt(prs)]);
	}
	
	//OPERATOR PARSING
	let opCount = (str.match(/(\$\+)/g) || []).length;
	for(let i=0; i<opCount; i++){
		let prs="";
		let subPrs="";
		for(let j=str.indexOf("$+")-1; j>=0; j--){
			if(str.charAt(j) == '('){
				break;
			}
			prs=str.charAt(j)+prs;
		}
		for(let j=str.indexOf("$+")+2; j<str.length; j++){
			if(str.charAt(j) == ')'){
				break;
			}
			subPrs+=str.charAt(j);
		}
		if(isNaN(prs) || isNaN(subPrs)){
			str = str.replace('('+prs+'$+'+subPrs+')', prs+subPrs);
		}
		else{
			str = str.replace('('+prs+'$+'+subPrs+')', parseFloat(prs)+parseFloat(subPrs));
		}
	}
	str = Operate('-', str, new RegExp("([\$]\-)", "g"));
	str = Operate('*', str, new RegExp("([\$][\*])", "g"));
	str = Operate('/', str, new RegExp("([\$]\/)", "g"));
	str = Operate('%', str, new RegExp("([\$]\%)", "g"));
	str = Operate('=<', str, new RegExp("([\$]\=\<)", "g"));
	str = Operate('=>', str, new RegExp("([\$]\=\>)", "g"));
	str = Operate('<', str, new RegExp("([\$]\<)", "g"));
	str = Operate('>', str, new RegExp("([\$]\>)", "g"));
	str = Operate('=', str, new RegExp("([\$]\=)", "g"));
	str = Operate('!=', str, new RegExp("([\$]\!\=)", "g"));
	
	//FUNCTION PARSING
	let prs="", subPrs="", read="";
	for (let i=0; i<str.length; i++){
		if(str.charAt(i) === ' '){
			break;
		}
		read+=str.charAt(i);
	}
	if(read == ""){
		return;
	}
	switch (read.toLowerCase()){
		case "say":
			for (let i=4; i<str.length; i++){
				prs+=str.charAt(i);
			}
			Print(prs);
			break;
			
		case "clr":
			Clear();
			break;
			
		case "info":
			for (let i=5; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ""){
				Print(" S-COM Command-Oriented Language (SCCOL) v1.0. © SCP Foundation 1982-2004.");
				Print(" "+navigator.platform+Define(navigator.oscpu)+" "+navigator.language+". "+Define(navigator.vendor));
				Print(" "+Define(navigator.userAgent));
				Print(" Display: "+screen.width.toString()+"x"+screen.height.toString()+", "+screen.colorDepth.toString()+" bit.");
				Print("  ");
				break;
			}
			if(commands.hasOwnProperty(prs.toLowerCase())){
				Print(commands[prs.toLowerCase()].name);
				Print(commands[prs.toLowerCase()].info);
				Print('Example of usage: \n'+commands[prs.toLowerCase()].example);
				break;
			}
			Print('No information found about "'+prs+'" command.');
			break;
			
		case "cmds":
			for (let c in commands){
				let cName = commands[c].name;
				let cInfo = commands[c].info_short;
				for(let i=0; i<Math.round(2-cName.length/32); i++){
					cName += '	';
				}
				Print(cName+cInfo);
			}
			break;
			
		case "set":
			for (let i=4; i<str.length; i++){
				if(str.charAt(i) == ' '){
					break;
				}
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			for (let i=5+prs.length; i<str.length; i++){
				subPrs+=str.charAt(i);
			}
			if(subPrs == ""){
				Error('Value expected.');
				break;
			}
			if(isNaN(subPrs)){
				buffer[parseInt(prs)] = subPrs;
				break;
			}
			buffer[parseInt(prs)] = parseFloat(subPrs);
			break;
			
		case "mem":
			for (let i=4; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs != ''){
				if(functions[prs] != null){
					Print(prs+':');
					Print(functions[prs]);
					break;
				}
			}
			for(let i=0; i<buffer.length; i++){
				if(buffer[i] != null){
					Print(i.toString()+': '+buffer[i]);
				}
			}
			for(var p in functions){
				Print(p+';');
			}
			break;
			
		case "free":
			for (let i=5; i<str.length; i++){
				if(str.charAt(i) == ' '){
					break;
				}
				prs+=str.charAt(i);
			}
			if(isNaN(prs)){
				if(!functions.hasOwnProperty(prs)){
					Error('No "'+prs+'" procedure found.');
					break;
				}
				delete functions[prs];
				break;
			}
			for (let i=6+prs.length; i<str.length; i++){
				subPrs+=str.charAt(i);
			}
			if(subPrs=="" || subPrs==prs){
				subPrs=parseInt(prs)+1;
			}
			else{
				subPrs=parseInt(subPrs)+1;
			}
			if(isNaN(subPrs)){
				Error('Unexpected buffer end value type.');
				break;
			}
			for (let i=parseInt(prs); i<parseInt(subPrs); i++){
				buffer[i] = null;
			}
			
			break;
			
		case "proc":
			for (let i=5; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ""){
				Error('Invalid procedure name.');
				break;
			}
			console.log(prs);
			openedFunction = prs;
			functions[openedFunction] = " ";
			break;
			
		case "key":
			for (let i=4; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			await Sleep(1);
			lastKey = 0;
			Input(false);
			return new Promise(async function(resolve){
				function Check(){
					if(lastKey != 0){
						buffer[parseInt(prs)] = parseInt(lastKey);
						resolve();
					}
				}
				while(lastKey == 0){
					await Sleep(10);
					Check();
				}
			});
			break;
			
		case "get":
			for (let i=4; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			Input("input");
			await Sleep(1);
			lastKey = 0;
			return new Promise(async function(resolve){
				function Check(){
					if(lastKey == 13){
						buffer[parseInt(prs)] = consoleInput.value.replace(/\n/g, '');
						Print(consoleInput.value);
						consoleInput.value = "";
						resolve();
					}
				}
				while(lastKey != 13){
					await Sleep(10);
					Check();
				}
			});
			break;
			
		case "call":
			for (let i=5; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ""){
				Error('Invalid procedure name.');
				break;
			}
			if(!functions.hasOwnProperty(prs)){
				Error('No "'+prs+'" procedure found.');
				break;
			}
			//CompileBatch(functions[prs]);
			var func = functions[prs].split(';');
			for(let i=0; i<func.length; i++){
				await CleanCompile(func[i]);
			}
			break;
			
		case "acall":
			for (let i=6; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ""){
				Error('Invalid procedure name.');
				break;
			}
			if(!functions.hasOwnProperty(prs)){
				Error('No "'+prs+'" procedure found.');
				break;
			}
			CompileBatch(functions[prs]);
			/*var func = functions[prs].split(';');
			for(let i=0; i<func.length; i++){
				CleanCompile(func[i]);
			}*/
			break;
			
		case "internal":
			for (let i=9; i<str.length; i++){
				prs+=str.charAt(i);
			}
			try{
				eval(prs);
			}
			catch(e){
				Error(e.toString());
			}
			break;
			
		case "if":
			if(!str.includes('(')){
				Error('"(" expected.');
				break;
			}
			if(!str.includes(')')){
				Error('")" expected.');
				break;
			}
			for (let i=str.indexOf('(')+1; i<str.length; i++){
				if(str.charAt(i) == ')'){
					break;
				}
				prs+=str.charAt(i);
			}
			for (let i=str.indexOf('(')+2+prs.length; i<str.length; i++){
				subPrs+=str.charAt(i);
			}
			if(prs.toLowerCase() == "true"){
				CompileBatch(subPrs);
			}
			break;
			
		case "fetch":
			for (let i=6; i<str.length; i++){
				if(str.charAt(i) == ' '){
					break;
				}
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid URL.');
				break;
			}
			for (let i=7+prs.length; i<str.length; i++){
				subPrs+=str.charAt(i);
			}
			if(subPrs == ''){
				/*
				let rawFile = new XMLHttpRequest();
				rawFile.open("GET", prs, true);
				rawFile.onreadystatechange = function ()
				{
					if(rawFile.readyState === 4)
					{
						if(rawFile.status === 200 || rawFile.status == 0)
						{
							var allText = rawFile.responseText;
							Print(allText);
						}
					}
				}
				rawFile.send(null);
				*/
				var responseHTML = document.createElement("body");
				
				break;
			}
			if(isNaN(subPrs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			fetch(prs)
			.then((data) => {
				buffer[parseInt(subPrs)] = data;
			});
			
			break;
			
		case "bg":
			for (let i=3; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(!isNaN(prs)){
				document.body.style.background = parseInt(prs);
				break;
			}
			document.body.style.background = prs;
			break;
			
		case "int":
			for (let i=4; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			if(buffer[parseInt(prs)] == null){
				Error('Buffer block value undefined.');
				break;
			}
			if(isNaN(buffer[parseInt(prs)])){
				buffer[parseInt(prs)] = buffer[parseInt(prs)].charCodeAt();
				break;
			}
			buffer[parseInt(prs)] = Math.floor(buffer[parseInt(prs)]);
			break;
			
		case "char":
			for (let i=5; i<str.length; i++){
				if(str.charAt(i) == ' '){
					break;
				}
				prs+=str.charAt(i);
			}
			for (let i=6+prs.length; i<str.length; i++){
				subPrs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			if(buffer[parseInt(prs)] == null){
				Error('Buffer block value undefined.');
				break;
			}
			if(subPrs != ''){
				if(isNaN(subPrs)){
					Error('Unexpected char index type.');
					break;
				}
				buffer[parseInt(prs)] = buffer[parseInt(prs)].charAt(parseInt(subPrs));
				break;
			}
			buffer[parseInt(prs)] = String.fromCharCode(parseInt(buffer[parseInt(prs)]));
			break;
			
		case "wait":
			for (let i=5; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid wait amount.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected wait amount type.');
				break;
			}
			paused = true;
			await Sleep(parseInt(prs));
			break;
			
		case "sin":
			for (let i=4; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			if(isNaN(buffer[parseInt(prs)])){
				Error('Unexpected buffer block value type.');
				break;
			}
			if(buffer[parseInt(prs)] == null){
				Error('Buffer block value undefined.');
				break;
			}
			buffer[parseInt(prs)] = parseFloat(Math.sin(buffer[parseInt(prs)]).toFixed(6));
			break;
			
		case "cos":
			for (let i=4; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			if(isNaN(buffer[parseInt(prs)])){
				Error('Unexpected buffer block value type.');
				break;
			}
			if(buffer[parseInt(prs)] == null){
				Error('Buffer block value undefined.');
				break;
			}
			buffer[parseInt(prs)] = parseFloat(Math.cos(buffer[parseInt(prs)]).toFixed(6));
			break;
			
		case "abs":
			for (let i=4; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			if(isNaN(buffer[parseInt(prs)])){
				Error('Unexpected buffer block value type.');
				break;
			}
			if(buffer[parseInt(prs)] == null){
				Error('Buffer block value undefined.');
				break;
			}
			buffer[parseInt(prs)] = Math.abs(buffer[parseInt(prs)]);
			break;
			
		case "frac":
			for (let i=5; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			if(isNaN(buffer[parseInt(prs)])){
				Error('Unexpected buffer block value type.');
				break;
			}
			if(buffer[parseInt(prs)] == null){
				Error('Buffer block value undefined.');
				break;
			}
			let frac = parseFloat((buffer[parseInt(prs)] % 1).toFixed(6));
			buffer[parseInt(prs)] = frac;
			break;
			
		case "length":
			for (let i=7; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid buffer block number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected buffer block number type.');
				break;
			}
			if(buffer[parseInt(prs)] == null){
				Error('Buffer block value undefined.');
				break;
			}
			buffer[parseInt(prs)] = buffer[parseInt(prs)].length;
			break;
			
		case "wave":
			for (let i=5; i<str.length; i++){
				if(str.charAt(i) == ' '){
					break;
				}
				prs+=str.charAt(i);
			}
			for (let i=6+prs.length; i<str.length; i++){
				subPrs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid channel number.');
				break;
			}
			if(subPrs == ''){
				Error('Invalid frequency value.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected channel number type.');
				break;
			}
			if(isNaN(subPrs)){
				Error('Unexpected frequency value type.');
				break;
			}
			prs = parseInt(prs);
			subPrs = parseFloat(subPrs);
			try{
				let o = channelBuffer[prs];
				o.stop();
			}
			catch(e){
				Error(e.toString());
			}
			channelBuffer[prs] = context.createOscillator();
			o = channelBuffer[prs];
			switch (prs){
				case 0:
					o.type = 'square';
					break;
				case 1:
					o.type = 'square';
					break;
				case 2:
					o.type = 'sine';
					break;	
				case 3:
					o.type = 'triangle';
					break;
				case 4:
					o.type = 'sawtooth';
					break;
				default:
					Error('Channel number out of range.');
					break;
			}
			let g = gainBuffer[prs];
			o.frequency.value = subPrs
			o.connect(g);
			g.connect(context.destination);
			try{
				o.start();
			}
			catch(e){
				Error(e.toString());
			}
			
			//g.gain.exponentialRampToValueAtTime(0, context.currentTime + 0.5);
			break;
			
		case "stop":
			for (let i=5; i<str.length; i++){
				prs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid channel number.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected channel number type.');
				break;
			}
			prs = parseInt(prs);
			try{
				channelBuffer[prs].stop();
			}
			catch(e){
				Error(e.toString());
			}
			break;
			
		case "gain":
			for (let i=5; i<str.length; i++){
				if(str.charAt(i) == ' '){
					break;
				}
				prs+=str.charAt(i);
			}
			for (let i=6+prs.length; i<str.length; i++){
				subPrs+=str.charAt(i);
			}
			if(prs == ''){
				Error('Invalid channel number.');
				break;
			}
			if(subPrs == ''){
				Error('Invalid gain value.');
				break;
			}
			if(isNaN(prs)){
				Error('Unexpected channel number type.');
				break;
			}
			if(isNaN(subPrs)){
				Error('Unexpected gain value type.');
				break;
			}
			prs = parseInt(prs);
			subPrs = parseFloat(subPrs);
			try{
				gainBuffer[prs].gain.exponentialRampToValueAtTime(subPrs, context.currentTime + 0.4);
			}
			catch(e){
				Error(e.toString());
			}
			break;
			
		case "js":
			js = true;
			break;
			
		case "":
			break;
			
		case "sccol":
			js = false;
			break;
			
		case "//":
			break;
			
		default:
			Error('Unknown command or reference "'+read+'".');
	}
	if(!paused){
		return true;
	}
}
function Sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}
function Error(str){
	Print('%$RError: '+str);
}
function Define(val){
	if(val == null){
		return "";
	}
	return val;
}
function Operate(op, str, regexp){
	let count = (str.match(regexp) || []).length;
	//console.log(op+'  '+count);
	for(let i=0; i<count; i++){
		let prs="";
		let subPrs="";
		for(let j=str.indexOf("$"+op)-1; j>=0; j--){
			if(str.charAt(j) == '('){
				break;
			}
			prs=str.charAt(j)+prs;
		}
		for(let j=str.indexOf("$"+op)+1+op.length; j<str.length; j++){
			if(str.charAt(j) == ')'){
				break;
			}
			subPrs+=str.charAt(j);
		}
		//console.log("LEFT SIDE: "+prs+"\nRIGHT SIDE: "+subPrs);
		if(op=='-'){
			if(isNaN(prs) && !isNaN(subPrs)){
				str = str.replace('('+prs+'$-'+subPrs+')', prs.substring(0, prs.length-parseInt(subPrs)-1));
				return str;
			}
			if(!isNaN(prs) && isNaN(subPrs)){
				str = str.replace('('+prs+'$-'+subPrs+')', subPrs.substring(parseInt(prs)));
				return str;
			}
		}
		if(op=='='){
			if(prs == subPrs){
				str = str.replace('('+prs+'$='+subPrs+')', "(TRUE)");
			}
			return str;
		}
		if(op=='!='){
			if(prs != subPrs){
				str = str.replace('('+prs+'$!='+subPrs+')', "(TRUE)");
			}
			return str;
		}
		if(isNaN(prs) || isNaN(subPrs)){
			Error('Unexpected type found when using "'+op+'" operator.');
		}
		else{
			if(op=='-'){
				str = str.replace('('+prs+'$-'+subPrs+')', parseFloat(prs)-parseFloat(subPrs));
			}
			if(op=='*'){
				str = str.replace('('+prs+'$*'+subPrs+')', parseFloat(prs)*parseFloat(subPrs));
			}
			if(op=='/'){
				str = str.replace('('+prs+'$/'+subPrs+')', parseFloat(prs)/parseFloat(subPrs));
			}
			if(op=='%'){
				str = str.replace('('+prs+'$%'+subPrs+')', parseFloat(prs)%parseFloat(subPrs));
			}
			if(op=='=<'){
				if(parseFloat(prs) <= parseFloat(subPrs)){
					str = str.replace('('+prs+'$=<'+subPrs+')', "(TRUE)");
				}
			}
			if(op=='<'){
				if(parseFloat(prs) < parseFloat(subPrs)){
					str = str.replace('('+prs+'$<'+subPrs+')', "(TRUE)");
				}
			}
			if(op=='=>'){
				if(parseFloat(prs) >= parseFloat(subPrs)){
					str = str.replace('('+prs+'$=>'+subPrs+')', "(TRUE)");
				}
			}
			if(op=='>'){
				if(parseFloat(prs) > parseFloat(subPrs)){
					str = str.replace('('+prs+'$>'+subPrs+')', "(TRUE)");
				}
			}
		}
	}
	return str;
}