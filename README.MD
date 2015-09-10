# A858 Decrypter

Usage:

    $ npm install -g a858decrypter
    $ massdecrypt --in-file all_posts.csv --key-file keys.txt --key-transform md5 --key-transform dehex --keyiv 0 --modes des-ede 

The mass decrypt cli application will then attempt all keys inside of the keys.txt, perform the transforms,
load in the post list and then perform the decryption and output them to the files. 

This command may seem long winded however there are some sensible defaults which are explained below. Sometimes you may want to be specific with what you are doing so you can be sure you have properly tried a decryption key.

# Command Information

```
  A858 Decrypter
  Decrypts A858 posts based on a key list and cipher modes.

  -n, --keyiv <number>             Number of null bytes to use for a null IV to allow for unknown IV raw key
                                   decryption.
                                   Defaults: NONE USED
  -h, --help                       Show this usage information
  -p, --preprocessor <string[]>    Specifies javascript files of which exports a function that pre-processes the
                                   post data into keys, ivs or mutates the post. View the API to see what you can
                                   do at the GitHub project.
                                   Defaults: NONE
  -o, --out-ascii <string>         File to place ASCII encoded output
                                   Defaults: [<ISODATE>][ASCII][Results].txt
  -u, --out-unicode <string>       File to place Unicode encoded output
                                   Defaults: [<ISODATE>][Unicode][Results].txt
  -c, --out-csv <string>           Output the decrypted results to a new file if the decrypted posts was hex,
                                   ready for reprocessing
                                   Defaults: [<ISODATE>]hex-posts.csv
  -i, --in-file <string>           CSV File containing A858 post data
  								   Defaults: all.csv
  [-e, --errors <string>            Out file for errors] IN PRODUCTION
                                
  -k, --key-file <string>          Line separated keys. May specify IVs on the same line usng key=iv. You can
                                   change this separater using the -iv-seperator switch
                                   Defaults: keys.txt
  -s, --iv-separator <string>      The seperator for the IV in the key file.
  								   Defaults: =
  -w, --workers <number>           Number of worker threads to use
     							   Defaults: 4
  -m, --modes <string[]>           The cipher modes to use, allowed ciphers: CAST-cbc, aes-128-cbc,
                                   aes-128-cbc-hmac-sha1, aes-128-cfb, aes-128-cfb1, aes-128-cfb8, aes-128-ctr,
                                   aes-128-ecb, aes-128-gcm, aes-128-ofb, aes-128-xts, aes-192-cbc, aes-192-cfb,
                                   aes-192-cfb1, aes-192-cfb8, aes-192-ctr, aes-192-ecb, aes-192-gcm,
                                   aes-192-ofb, aes-256-cbc, aes-256-cbc-hmac-sha1, aes-256-cfb, aes-256-cfb1,
                                   aes-256-cfb8, aes-256-ctr, aes-256-ecb, aes-256-gcm, aes-256-ofb, aes-256-xts,
                                   aes128, aes192, aes256, bf, bf-cbc, bf-cfb, bf-ecb, bf-ofb, blowfish,
                                   camellia-128-cbc, camellia-128-cfb, camellia-128-cfb1, camellia-128-cfb8,
                                   camellia-128-ecb, camellia-128-ofb, camellia-192-cbc, camellia-192-cfb,
                                   camellia-192-cfb1, camellia-192-cfb8, camellia-192-ecb, camellia-192-ofb,
                                   camellia-256-cbc, camellia-256-cfb, camellia-256-cfb1, camellia-256-cfb8,
                                   camellia-256-ecb, camellia-256-ofb, camellia128, camellia192, camellia256,
                                   cast, cast-cbc, cast5-cbc, cast5-cfb, cast5-ecb, cast5-ofb, des, des-cbc,
                                   des-cfb, des-cfb1, des-cfb8, des-ecb, des-ede, des-ede-cbc, des-ede-cfb,
                                   des-ede-ofb, des-ede3, des-ede3-cbc, des-ede3-cfb, des-ede3-cfb1,
                                   des-ede3-cfb8, des-ede3-ofb, des-ofb, des3, desx, desx-cbc, id-aes128-GCM,
                                   id-aes192-GCM, id-aes256-GCM, idea, idea-cbc, idea-cfb, idea-ecb, idea-ofb,
                                   rc2, rc2-40-cbc, rc2-64-cbc, rc2-cbc, rc2-cfb, rc2-ecb, rc2-ofb, rc4, rc4-40,
                                   rc4-hmac-md5, seed, seed-cbc, seed-cfb, seed-ecb, seed-ofb
                                   Defaults to: des-ede
  -a, --all-ciphers                Switch if it should decrypt using all possible ciphers
  -t, --key-transform <string[]>   Specifies whether to use a transform on the key. Defaults to none. Potential
                                   transforms are: none, dehex, enhex, string, uppercase, lowercase,
                                   DSA-SHA1-old, dsa, dsa-sha, dsa-sha1, dsaEncryption, dsaWithSHA, dsaWithSHA1,
                                   dss1, ecdsa-with-SHA1, md4, md4WithRSAEncryption, md5, md5WithRSAEncryption,
                                   mdc2, mdc2WithRSA, ripemd, ripemd160, ripemd160WithRSA, rmd160, rsa-md4,
                                   rsa-md5, rsa-mdc2, rsa-ripemd160, rsa-sha, rsa-sha1, rsa-sha1-2, rsa-sha224,
                                   rsa-sha256, rsa-sha384, rsa-sha512, sha, sha1, sha1WithRSAEncryption, sha224,
                                   sha224WithRSAEncryption, sha256, sha256WithRSAEncryption, sha384,
                                   sha384WithRSAEncryption, sha512, sha512WithRSAEncryption,
                                   shaWithRSAEncryption, ssl2-md5, ssl3-md5, ssl3-sha1, whirlpool
                                   Transforms are processed in order. Hashing algorithms output in hex so you may
                                   want to dehex.

  Project home: https://github.com/TomCaserta/A858Decrypter ReadMe: https://github.com/TomCaserta/A858Decrypter/README.MD
```

# Key Transformations

Transforms can be made to keys by specifying the -t switch. You can have multiple transforms done to a key in the key file.

All of these transforms will be performed on the key in order they appear in the command. It will not modify the original file however the new key will be used for decryption.

# TODO

* Properly implement post pre-processors
* Implement errors file
* Optimise the testing of keys, currently when each new key is attempted. Each post is serialised with that key when sent to the decrypter thread. This is highly inefficient and makes it impossible to use large key lists.
* Properly implement an API so the functionality can be extended