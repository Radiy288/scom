var buffer = [];
var functions = {};
var openedFunction;

function CompileBatch(str){
	let cmds = str.split(';');
	cmds.forEach(function(item){
		for(let i=0; i<item.length; i++){
			if(item.charAt(i) == ' ' || item.charAt(i) == '\n'){
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
			Compile(item);
		}
	});
}
function Compile(str){
	let varCount = (str.match(/(\%\^)/g) || []).length;
	
	//VARIABLE PARSING
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
				Print(" S-COM SOFTWARE 1.5 Console. © SCP Foundation 1982-1997.");
				Print(" "+navigator.platform+Define(navigator.oscpu)+" "+navigator.language+". "+Define(navigator.vendor));
				Print(" "+Define(navigator.userAgent));
				Print(" Display: "+screen.width.toString()+"x"+screen.height.toString()+", "+screen.colorDepth.toString()+" bit.");
				Print("  ");
			}
			break;
			
		case "set":
			for (let i=4; i<str.length; i++){
				if(str.charAt(i) == ' '){
					break;
				}
				prs+=str.charAt(i);
			}
			if(isNaN(prs)){
				Error('Unexpected buffer value type.');
				return;
			}
			for (let i=5+prs.length; i<str.length; i++){
				subPrs+=str.charAt(i);
			}
			if(subPrs == ""){
				Error('Value expected.');
				return;
			}
			if(isNaN(subPrs)){
				buffer[parseInt(prs)] = subPrs;
				return;
			}
			buffer[parseInt(prs)] = parseFloat(subPrs);
			break;
			
		case "mem":
			for(let i=0; i<buffer.length; i++){
				if(buffer[i] != null){
					Print(i.toString()+': '+buffer[i]);
				}
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
				Error('Unexpected buffer start value type.');
				return;
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
				return;
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
				return;
			}
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
				return;
			}
			if(!functions.hasOwnProperty(prs)){
				Error('No "'+prs+'" procedure found.');
				return;
			}
			CompileBatch(functions[prs]);
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
				return;
			}
			if(!str.includes(')')){
				Error('")" expected.');
				return;
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
			
		case "":
			break;
			
		default:
			Error('Unknown command or reference "'+read+'".');
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