# License Manager
License Manager is a web-based application for managing licenses for applications which can be installed on a PC, tablet, or phone.  

Each license is a text file which contains software name, device unique identifier and license expiration date. The protected application uses the information from the license file to validate that it is licensed. To prevent tampering of the license file it is encrypted using public-key cryptography and the public key should be embedded into the protected application at the compile time.  

Licenses can be issued both manually and automatically. In the manual mode, the device unique identifier should be provided to the license administrator to generate a license. In the automatic mode, the license administrator issues a provisional license which can be activated by the licensed application automatically.

License Server also support license recalling. It is implemented as a web-service that the protected application can call to validate that its license is still valid.

It is responsibility of the protected software to generate unique device identifier. License Manager is only responsible for storing them inside the license file.

## Running instructions
The License Manager requires Node.js and MongoDB to run.

* cd into the source folder.
* Run *npm install* to install all required npm packages.
* Run the server by executing *node ./server.js*.
* Access License Manager by opening *http://localhost:8000*

## Running tests
The ./test folder contains Mocha tests for web-services exposed by License Manager.

* Start License Server
* cd into *./test* subfolder.
* Run *npm install* to install all required npm packages.
* Run the tests by executing *node_modules/.bin/mocha test.js*
