var declib = require("./../main.js");
var Post = declib.Post;
var Key = declib.Key;
var PostList = declib.PostList;
var KeyList = declib.KeyList;
var Decrypter = declib.Decrypter;

var postList = new PostList();
var keyList = new KeyList();
var key = new Key("A858DE45F56D9BC9");
keyList.push(key);

for (var i = 0; i < 5000; i++) {
	var asopPost = new Post("2012",0,"1C326DEAD01C40 AE67BE3769D8D3 5CA8434AB6B765 CAB8FF6E55CDA6 81F32B333843D6 7F6EA18160E3B3 8441176FC01E8C 627106AEEC9043 3E31514EF3F161 F3282FF88A066B C12830AD3C7B09 4FF3A0FF7D1A25 84E6D53CF61374 D77E7B49D45D2A 923EBD4D8CAD69 28138FB4B8FD25 7487E2C9E04312 185EEC58F8E1C7 91E2D5D2816A78 6D5291C693F2BC E6094EADEEA0BB CCEDB61B7BFC70 3A05B40929DBDE 3FAC9B8B537D31 9137C23CC371F6 1EE035AA410A85 A3926F8E448E27 54292DDB7980CA 3D79CABC459804 FF5CE0CB069CED 04C4FFD8A94403 3EB838AFDF68CE","");
	var postBuffer = asopPost.getHexBuffer();
	postList.push(asopPost);
}

var decrypter = new Decrypter(postList, keyList, ["des-ede"], 4);
var decryptionStartTime = new Date();
var n = 0;

decrypter.on("decrypt", function (event) {	
	n++;
	//console.log("Success", n);
});
decrypter.on("error", function (err) { 
	console.log(err);
});

decrypter.on("done", function () { 
	var decryptionEndTime = new Date();
	console.log("Finished took ", (decryptionEndTime - decryptionStartTime),"ms");
});
decrypter.decrypt();