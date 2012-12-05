project.goorm
=========================

goorm is the cloud-based Integrated Development Environment. It is developed in only javascript and using various open source libraries. It is also an open-source project. goorm supports currently C/C++ and Java as well as HTML, CSS, PHP and Javascript. Other languages will be supported with plugin. (future works).

* **goorm is developing now and this repository provides only beta version.**
* **please, feedback to us about bugs and feature what you need.** (email: sungtae.ryu@goorm.io)

Installation
------------

  install using npm :

          $ npm install goorm -g

Official Site
-------------

* http://goorm.io
* http://goorm.org

Features
--------

* **Build your own cloud integrated development environment**
* **Support various plug-ins**
* **Collaborate on projects in real-time with other developers**
* **Design UI/UML**
* **Support syntax highlighting**
* **Powerful search/replace**
* **Customize your own goorm**
* **Manage your project via subversion/git**
* **Work with the useful terminal**
* **and so on...**

Getting Started
---------------

* **node.js installation**

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

  install npm (optional- latest version of node.js automatically install npm, so you may not install npm) :
  
  it requires curl to install npm, install curl as below :
        
          $ sudo chown -R $USER /usr/local
          $ apt-get install curl
  
  then, install npm :
  
          $ curl http://npmjs.org/install.sh > install.sh
          $ sudo sh install.sh
  
* **Download**

  clone goorm (git) :

          $ git clone git://github.com/xenoz0718/goorm.git

  checkout goorm (svn) :
  
          $ svn checkout svn://svn.code.sf.net/p/goorm/code/trunk goorm 

  or using npm :

          $ npm install goorm -g
                 

* **Run**

  run mongodb:
    
          $ mongod
          
  if mongodb installed successfully, it prints information as below:

          ...
          Thu Oct  4 23:26:15 [websvr] admin web console waiting for connections on port 28017
          Thu Oct  4 23:26:15 [initandlisten] waiting for connections on port 27017
          ...

  run goorm.js :
          
          $ node goorm.js start
          
  run goorm.js (through npm) : 
  
          $ goorm start
          
  run goorm daemon :

          $ node goorm.js start -d
          $ goorm start -d

  config (optional) : 

          $ node goorm.js set --workspace ~/workspace/
          $ goorm set -w ~/workspace/
          
          $ node goorm.js set --temp-directory ~/temp_files/
          $ goorm set -t ~/temp_files/
          
          $ node goorm.js set -f appId, appSecret
          $ goorm set --api-key-facebook appId, appSecret

          $ node goorm.js set -b consumerKey, consumerSecret
          $ goorm set --api-key-twitter consumerKey, consumerSecret

          $ node goorm.js set -g appId, appSecret
          $ goorm set --api-key-google appId, appSecret

          $ node goorm.js set -h appId, appSecret
          $ goorm set --api-key-github appId, appSecret

  stop goorm daemon : 

          $ node goorm.js stop
          $ goorm stop
          
  if goorm runned successfully, it prints information as below :
  
          goormIDE:: loading config...
          /--------------------------------------------------------
          workspace_path: /Users/goormUser/workspace/
          temp_dir_path: /Users/goormUser/temp_files/
          goormIDE:: starting...
          /--------------------------------------------------------
          info  - socket.io started
          goorm IDE server listening on port 9999 in development mode
          Open your browser and connect to
          'http://localhost:9999' or 'http://[YOUR IP/DOMAIN]:9999'

  run goorm.js:
          
          $ node goorm.js
          
  you can run the goorm as below URL in your web-browser (google chrome is hardly recommended) : 

          http://localhost:9999
        
License
-------

goorm is provided under the [GNU General Public License Version 3.0(GPLv3)](http://gplv3.fsf.org/)