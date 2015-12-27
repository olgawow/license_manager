# License Manager
License Manager is a web-based application for managing licenses for applications which can be installed on a PC, tablet, or phone.  

Each license is a text file which contains software name, device unique identifier and license expiration date. The protected application uses the information from the license file to validate that it is licensed. To prevent tampering of the license file it is encrypted using public-key cryptography and the public key should be embedded into the protected application at the compile time.  

Licenses can be issued both manually and automatically. In the manual mode, the device unique identifier should be provided to the license administrator to generate a license. In the automatic mode, the license administrator issues a provisional license which can be activated by the licensed application automatically.

License Server also support license recalling. It is implemented as a web-service that the protected application can call to validate that its license is still valid.

It is responsibility of the protected software to generate unique device identifier. License Manager is only responsible for storing them inside the license file.
