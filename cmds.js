//SCCOL COMMANDS V0.9
var commands = {
	"//": {
		"name": "// (str)",
		"info_short": "Declares a comment.",
		"info": "Declares a comment that won't get compiled. Starts with // and should end with a semicolon (;).\n(str) - the comment string.",
		"example": "  // This is a comment. It won't get compiled. It is important to put a space after // and a semicolon at the end.;"
	},
	"abs": {
		"name": "ABS {num}",
		"info_short": "Sets a memory buffer block to its absolute value.",
		"info": "Sets the specified memory buffer block to its absolute value.\n{num} - the specified memory block number to assign to.",
		"example": "  SET 0 -32;\n  ABS 0;"
	},
	"bg": {
		"name": "BG {col}",
		"info_short": "Sets background color.",
		"info": "Sets the background color to a specified color.\n{col} - the specified color. Can be a hexademical value or a string.",
		"example": "  BG GRAY;"
	},
	"call": {
		"name": "CALL {proc}",
		"info_short": "Calls a previously declared procedure.",
		"info": "Calls the specified previously declared procedure.\n{proc} - the specified procedure that was declared using the [PROC {name}] command.",
		"example": "  CALL MAIN;"
	},
	"char": {
		"name": "CHAR {num} (index)",
		"info_short": "Converts memory buffer block value to character.",
		"info": "Converts a real number to a character or gets a character at position (index) in a string in the specified memory buffer block.\n{num} - the specified memory buffer block number to get the value from and then assign to.\n(index) - the optionally specified position of the character in the string to set the value to.",
		"example": "  SET 0 Hello, World!;\n  CHAR 0 7;"
	},
	"clr": {
		"name": "CLR",
		"info_short": "Clears the screen of all text.",
		"info": "Clears the screen of all text.",
		"example": "  CLR;"
	},
	"cmds": {
		"name": "CMDS",
		"info_short": "Displays all available commands.",
		"info": "Displays all available commands on screen.",
		"example": "  CMDS;"
	},
	"cos": {
		"name": "COS {num}",
		"info_short": "Sets a memory buffer block to its cosine value (radians).",
		"info": "Sets the specified memory buffer block to its cosine value. You may use %^D2R to convert degrees to radians.\n{num} - the specified memory block number to assign to.",
		"example": "  SET 0 (90 $* %^D2R);\n  COS 0;"
	},
	"end": {
		"name": "END",
		"info_short": "Ends current procedure declaration or terminates the code.",
		"info": "Ends current procedure declaration, started using the [PROC {name}] command, or, if used outside of a procedure terminates the code execution.",
		"example": "  PROC MAIN;\n    SAY Hello, World!;\n  END;"
	},
	"frac": {
		"name": "FRAC {num}",
		"info_short": "Sets a memory buffer block value to its decimal remainder.",
		"info": "Sets a floating point number to its decimal remainder in the specified memory buffer block.\n{num} - the specified memory buffer block number to get the value from and then assign to.",
		"example": "  SET 0 (%^R $* 100);\n  INT 0;"
	},
	"free": {
		"name": "FREE {num/start} (end)",
		"info_short": "Frees a single or a range of memory buffer blocks.",
		"info": "Frees specified memory buffer block or a range of them, previously set by the [SET {num}] command.\n{num/start} - the specified memory buffer block number. If the (end) value is specified, acts as a start of a block removal range.\n(end) - the optionally specified end memory buffer block number to end the removal range on it. It is included in the removal range.",
		"example": "  FREE 0 16;"
	},
	"get": {
		"name": "GET {num}",
		"info_short": "Waits for user input to set its string to a memory buffer block.",
		"info": "Waits for user to input a string and hit Enter, then sets the input string to the specified memory buffer block.\n{num} - the specified memory buffer block number to assign to.",
		"example": "  GET 0;"
	},
	"if": {
		"name": "IF {(expr)} {cmd}",
		"info_short": "If an expression returns true, executes a command.",
		"info": "Checks to see if the specified expression returns true, and if it does, executes the specified command.\n{expr} - the specified expression.\n{cmd} - the specified command to execute.",
		"example": "  IF (!%^0) SAY Memory buffer block 0 is not defined;"
	},
	"info": {
		"name": "INFO (cmd)",
		"info_short": "Displays client information or command information.",
		"info": "Display information about the client on screen, or, if specified, about a command.\n(cmd) - the optionally specified command to show detailed information about.",
		"example": "  INFO CMDS;"
	},
	"int": {
		"name": "INT {num}",
		"info_short": "Converts memory buffer block value to integer.",
		"info": "Converts a floating point number or a character to an integer in the specified memory buffer block.\n{num} - the specified memory buffer block number to get the value from and then assign to.",
		"example": "  SET 0 (%^R $* 100);\n  INT 0;"
	},
	"js": {
		"name": "JS",
		"info_short": "Initiates JavaScript mode.",
		"info": "Initiates JavaScript mode. All input will then be interpreted as JavaScript code. To exit - use the [SCCOL] command.",
		"example": "  JS;"
	},
	"key": {
		"name": "KEY {num}",
		"info_short": "Waits for a keypress to set its value to a memory buffer block.",
		"info": "Waits for a keypress, then sets the value of the keypress to the specified memory buffer block.\n{num} - the specified memory buffer block number to assign to.",
		"example": "  KEY 0;"
	},
	"mem": {
		"name": "MEM (proc)",
		"info_short": "Displays the memory buffer or procedure code.",
		"info": "Displays the memory buffer, all declared procedures, or a single specified one's code on screen.\n(proc) - the optionally specified procedure name to display the code of. If used without this argument will display the memory buffer.",
		"example": "  MEM MAIN;"
	},
	"proc": {
		"name": "PROC {name}",
		"info_short": "Starts the declaration of a procedure.",
		"info": "Starts the declaration of a procedure with the specified name. All code after this command will be used as the procedure's code. Declaration must be ended with the [END] command.\n{name} - the specified procedure's name. Will be used to call the procedure after declaring it using the [CALL {proc}] command.",
		"example": "  PROC MAIN;\n    SAY Hello, World!;\n  END;"
	},
	"say": {
		"name": "SAY {str}",
		"info_short": "Displays a string of text.",
		"info": "Displays the specified string of text on screen.\n{str} - the specified string of text.",
		"example": "  SAY Hello, World!;"
	},
	"sccol": {
		"name": "SCCOL",
		"info_short": "Initiates SCCOL mode.",
		"info": "Initiates SCCOL mode. All input will then be interpreted as SCCOL commands. Is typically used to switch from another mode back to SCCOL.",
		"example": "  SCCOL;"
	},
	"set": {
		"name": "SET {num} {val}",
		"info_short": "Sets a memory buffer block to a value.",
		"info": "Sets the specified memory buffer block to a specified value.\n{num} - the specified memory block number to assign to.\n{val} - the specified value to assign to the memory block. Can be a real number or a string.",
		"example": "  SET 0 Hello, World!;"
	},
	"sin": {
		"name": "SIN {num}",
		"info_short": "Sets a memory buffer block to its sine value (radians).",
		"info": "Sets the specified memory buffer block to its sine value. You may use %^D2R to convert degrees to radians.\n{num} - the specified memory block number to assign to.",
		"example": "  SET 0 (90 $* %^D2R);\n  COS 0;"
	},
	"wait": {
		"name": "WAIT {ms}",
		"info_short": "Pauses for an amount of milliseconds.",
		"info": "Pauses the console for the specified amount of milliseconds.\n{ms} - the specified amount of milliseconds.",
		"example": "  WAIT 1000;"
	},
};
var constants = ["D2R", "E", "PI", "R", "R2D"]