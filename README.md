goorm
=========================

goorm is an open source project for cloud based integrated development Environment developed in using various open source libraries. goorm supports C/C++ and Java as well as HTML, CSS, PHP, Javascript and other languages.

Features
--------

* **Build your own cloud integrated development environment**
* **Support various plug-ins**
* **Collaborate on projects in real-time with other developers**
* **Design UI through goorm**
* **Reorganize your own goorm**
* **Support syntax highlighting**
* **Powerful search**
* **Design your own goorm**
* **Manage your project via FTP / SVN**
* **Work with useful Terminal**

Getting Started
---------------

* **Installation**

  install node.js :

          $ git clone http://github.com/joyent/node.git
          $ cd node
          $ tar -xvzf node-v0.8..tar.gz
          $ cd node-v0.8.2
          $ ./configure
          $ make
          $ sudo make install

  check node.js installed successfully :
  
          $ node -v
          
  if node.js installed successfully, it prints node.js version as below:
  
          $ v0.8.2

  install npm   
  it requires curl to install npm, install curl as below :
        
          $ sudo chown -R $USER /usr/local
          $ apt-get install curl
  
  then, install npm :
  
          $ curl http://npmjs.org/install.sh > install.sh
          $ sudo sh install.sh
  
* **Download**

  checkout goorm:
    
          $ svn checkout svn://svn.code.sf.net/p/goorm/code/trunk goorm 
          
  or
          
          $ git clone git://github.com/xenoz0718/goorm.git        

* **Run**

  run MongoDB:
    
          $ mongod
          
  if MongoDB installed successfully, it prints information as below:

          ...
          Thu Oct  4 23:26:15 [websvr] admin web console waiting for connections on port 28017
          Thu Oct  4 23:26:15 [initandlisten] waiting for connections on port 27017
          ...
        
  run goorm.js:
          
          $ node goorm.js
          
  if goorm runned successfully, it prints information as below:
  
          info  - socket.io started
          { port: 9999, process_name: 'goorm' }
          goorm IDE server listening on port 9999 in development mode
        
License
-------
goorm is provided under the [GNU General Public License Version 3.0(GPLv3)](http://gplv3.fsf.org/)