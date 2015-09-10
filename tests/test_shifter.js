var conv = require("binstring");

function text2hex (text) {
	return conv(text, {in: "binary", out:"hex"});
}
function hex2text (hex) {
	return conv(hex, {in: "hex", out:"binary"});
}
function text2byte (text) {
	return conv(text, {in:"binary", out:"bytes"})
}
function byte2text (bytes) {
	return conv(bytes, {in:"bytes", out:"binary"});
}
function hex2byte (hex) {
	return conv(hex, {in:"hex", out:"bytes"});
}
function rotateArray (arr, reverse, count){
	if (typeof arr == "string") {
		arr = arr.split("");
	}
	count = count != null ? count : 1;
	for (var i = 1; i <= count; i++) {
		if(reverse)
		arr.push(arr.shift());
		else
		arr.unshift(arr.pop());
	}
  	return arr;
} 


function shiftlines (lines) {
	for (var i = 0; i < lines.length; i++) {
		var currLine = lines[i];
		var currLineArr = currLine.split("");
		var rotateHex = currLineArr.shift();
		var shiftByte = hex2byte("0" + rotateHex)[0];
		currLineArr.shift(); // Removing this.
		currLineArr.pop(); // Removing hash on end too.
		var shiftedLine = rotateArray(currLineArr, true, shiftByte).join("");
		console.log(rotateHex + "#" + shiftedLine + "#");
	}
}

var lines = [
"9#G#Z#5K####ENJ#X2#",
"C####08#O5TB#1#C#4#",
"B#Y#EM#L###C5#IJS9#",
"9#O#X3R#4FOGOO#Y#Z#",
"D#UBKT#O6#I5##5VM##",
"6###J1W60SW#KZ6V8O#",
"5#9#PMX7X##YE#D#A5#",
"F#R#QP#R#EE##LDEGX#",
"5#FHHMJAG##7L#3#NF#",
"4#1W62#SI3C##E#G#M#",
"E##55HDG###AU9WHNH#",
"D#AQ92Z#WON#1B###J#",
"8#MT4QQE###VQSAQB##",
"5#ORDLP#IKJHP1#CSZ#",
"8#U#U#QG#R##KEN#YE#",
"A#N#ZSI#AFWK###T82#",
]
shiftlines(lines);

// var lines = [
// "249Z#O5XFMHJ#ZE2",
// "X#S#M8AGN#N#BSY8",
// "#CJYVV#E#GH#QC#T",
// "J#I#56DD3#W#A#N#",
// "N1#O#Z#L#E9BS1E#",
// "E#5O#KE#L#U1QPK#",
// "#BCG5#Y#7#A#VH#K",
// "#T#OIW#E#C#N#J#W",
// "#5#F#S#E#3#O#KRF",
// "#O#460X#GI#W#I#A",
// "K#L#O67RASG#E#G#",
// "58#R#WX#J#DZQPQI",
// "#0M3T1MPM2H2QL#S",
// "Z#EXKJPQH6594DUZ",
// "####B###HW5QTR##",
// "G#YOU#9RF1#AMOUN",
//  ];
