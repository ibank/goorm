project.goorm
=========================

goorm is the cloud-based Integrated Development Environment. It is developed in only javascript and using various open source libraries. It is also an open-source project. goorm supports currently C/C++ and Java as well as HTML, CSS, PHP and Javascript. Other languages will be supported with plugin. (future works).

* **goorm is developing now and this repository provides only alpha version.**
* **please, feedback to us about bugs and feature what you need.** (email: xenoz0718@gmail.com)

Installation
------------

  install using npm :

          $ npm install goorm -g

Official Site
-------------

Sorry! The official site of this project currently provides only in Korean now.
English site is preparing, now.

* http://goorm.io
* http://goorm.org

Features
--------

* **Build your own cloud integrated development environment**
* **Support various plug-ins**
* **Collaborate on projects in real-time with other developers**
* **Design UI through goorm** (not yet)
* **Reorganize your own goorm**
* **Support syntax highlighting**
* **Powerful search/replace**
* **Customize your own goorm** (not yet)
* **Manage your project via FTP / SVN** (not yet)
* **Work with the useful terminal**

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

* **Run**
        
  run goorm:
          
          $ goorm
          
  if you download goorm from git or svn, run goorm as follow :
  
          $ node goorm.js

  if goorm runned successfully, it prints information as below:
  
          info  - socket.io started
          { port: 9999, process_name: 'goorm' }
          goorm IDE server listening on port 9999 in development mode

  you can run the goorm as below URL in your web-browser (google chrome is hardly recommended)
  
          http://localhost:9999
        
License
-------
goorm is provided under the [GNU General Public License Version 3.0(GPLv3)](http://gplv3.fsf.org/)