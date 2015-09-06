var childprocess = require("child_process");
var fork = childprocess.fork;
var declib = require("./../main.js");
var Post = declib.Post;
var Key = declib.Key;


var decrypter = fork("./src/workers/decrypt.js");
var asopPost = new Post("2012",0,"1C326DEAD01C40 AE67BE3769D8D3 5CA8434AB6B765 CAB8FF6E55CDA6 81F32B333843D6 7F6EA18160E3B3 8441176FC01E8C 627106AEEC9043 3E31514EF3F161 F3282FF88A066B C12830AD3C7B09 4FF3A0FF7D1A25 84E6D53CF61374 D77E7B49D45D2A 923EBD4D8CAD69 28138FB4B8FD25 7487E2C9E04312 185EEC58F8E1C7 91E2D5D2816A78 6D5291C693F2BC E6094EADEEA0BB CCEDB61B7BFC70 3A05B40929DBDE 3FAC9B8B537D31 9137C23CC371F6 1EE035AA410A85 A3926F8E448E27 54292DDB7980CA 3D79CABC459804 FF5CE0CB069CED 04C4FFD8A94403 3EB838AFDF68CE","");
var postBuffer = asopPost.getHexBuffer();
var key = new Key("A858DE45F56D9BC9");

decrypter.send({
	task: "decrypt",
	buffer: postBuffer,
	identifier: 1,
	key: key,
	algorithm: "des-ede"
});

decrypter.on("message", function (data) {
	if (data.success) {
		console.log("Success");
	}
	decrypter.disconnect();
});