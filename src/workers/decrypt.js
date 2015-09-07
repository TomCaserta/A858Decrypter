/**
 * This is the main decryption worker file.
 * Multiple instances of this will be spun up
 * and will receive messages based on what to decrypt
 * the key and other data.
 */

var crypto = require("crypto");


function decrypt (buffer, key, algorithm, iv) {
	buffer = new Buffer(buffer);
	var decipher;
	if (!iv) {
		 decipher = crypto.createDecipher(algorithm, key);
	}
	else {
		decipher = crypto.createDecipheriv(algorithm, key, iv);
	}
	var decrypted = decipher.update(buffer, null, "hex");

	decrypted += decipher.final('hex');
	return decrypted;
}

process.on('message',function(msg){
 			//	console.log(msg);
	//console.log("Got task", msg);
 	switch (msg.task) {
 		case "decrypt":
 			var post = msg.buffer;
 			var keyObj = msg.key;
 			var algorithm = msg.algorithm;
 			var key = keyObj.key;
 			var iv = keyObj.iv;
 			var identifier = msg.identifier;
 			try {
 				var decryptedData = decrypt(post, key, algorithm, iv);
 				process.send({
 					success: true,
 					identifier: identifier,
 					result: decryptedData
 				});
 			}
 			catch (e) {
 				process.send({
 					success: false,
 					identifier: identifier,
 					result: e.message
 				})
 			}
 		break;
 	}
});