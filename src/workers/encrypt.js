/**
 * This is the main decryption worker file.
 * Multiple instances of this will be spun up
 * and will receive messages based on what to decrypt
 * the key and other data.
 */

var crypto = require("crypto");


function encrypt (buffer, key, algorithm, iv) {
	buffer = new Buffer(buffer);
	var cipherer;
	if (key instanceof Array) {
		key = new Buffer(key);
		iv = new Buffer([]);
	}
	if (!iv) {
		 cipherer = crypto.createCipher(algorithm, key);
	}
	else {
		cipherer = crypto.createCipheriv(algorithm, key, iv);
	}
	var encrypted = cipherer.update(buffer, null, "hex");

	encrypted += cipherer.final('hex');
	return encrypted;
}

process.on('message',function(msg){
 			//	console.log(msg);
	//console.log("Got task", msg);
 	switch (msg.task) {
 		case "encrypt":
 			var key = msg.key;
 			var identifier = msg.identifier;
 			try {
 				var encryptedData = encrypt("", key, "des-ede");
 			//	console.log("Success");//5DACFFBA8FF64DBD 12ECFFDF2899BD4C
 				if (encryptedData.toUpperCase() == "12ECFFDF2899BD4C") {
 					process.send({
	 					success: true,
	 					identifier: identifier,
	 					result: key
 					})
 				}
 				else {
 					process.send({
	 					success: false,
	 					identifier: identifier,
	 					result: "no result" + key + " = " + encryptedData
	 				});
 				}
 			}
 			catch (e) {
 			//	console.log("FAIL");
 				process.send({
 					success: false,
 					identifier: identifier,
 					result: e.message
 				})
 			}
 		break;
 	}
});