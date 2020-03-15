var buffer = [];
var functions = {};
var openedFunction;
var paused = false;
var js = false;

async function CompileBatch(str){
	if(js){
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
			await CleanCompile(cmds[index]);
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
		}
		else{
			functions[openedFunction] += str+';';
			console.log(str+';');
		}
	}
	else{
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
	let rndCount = (str.match(/(\%\^R)/g) || []).length;
	for(let i=0; i<rndCount; i++){
		str = str.replace("%^R", Math.random());
	}
	
	//VARIABLE PARSING
	let varCount = (str.match(/(\%\^)/g) || []).length;
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
				Print(" S-COM Command-Oriented Language (SCCOL) v0.9. © SCP Foundation 1982-2004.");
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
				for(let i=0; i<32-cName.length; i++){
					cName += ' ';
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
			
		case "end":
			Exit();
			
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
			let func = functions[prs].split(';');
			for(let i=0; i<func.length; i++){
				await CleanCompile(func[i]);
			}
			break;
			
		case "internal":
			for (let i=9; i<str.length; i++){
				prs+=str.charAt(i);
			}
			eval(prs);
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
			if(eval(prs)){
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
			document.body.style.background = prs;
			break;
			
		case "int":
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
			buffer[parseInt(prs)] = Math.floor(buffer[parseInt(prs)]);
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
			return new Promise(resolve => setTimeout(resolve, parseInt(prs)));
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
		for(let j=str.indexOf("$"+op)+2; j<str.length; j++){
			if(str.charAt(j) == ')'){
				break;
			}
			subPrs+=str.charAt(j);
		}
		if(isNaN(prs) || isNaN(subPrs)){
			Error('Unexpected type found when using "'+op+'" operator.');
		}
		else{
			if(op='-'){
				str = str.replace('('+prs+'$-'+subPrs+')', parseFloat(prs)-parseFloat(subPrs));
			}
			if(op='*'){
				str = str.replace('('+prs+'$*'+subPrs+')', parseFloat(prs)*parseFloat(subPrs));
			}
			if(op='/'){
				str = str.replace('('+prs+'$/'+subPrs+')', parseFloat(prs)/parseFloat(subPrs));
			}
		}
	}
	return str;
}