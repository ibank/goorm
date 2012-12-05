project.goorm
=========================

구름[goorm]은 오픈 소스로 진행 중인 클라우드 통합 개발 환경 프로젝트입니다. 오직 자바스크립트로만 개발되었으며, 다양한 오픈 소스 라이브러리를 사용하고 있습니다. 현재 구름은 C/C++, Java, HTML, CSS, PHP, Javascript 등의 개발을 지원합니다. 새로운 언어들도 플러그인 형태로 추가될 예정입니다.

* **구름은 현재 개발중이며, 현재 베타 버전으로 제공되고 있습니다.**
* **원하는 기능이 있거나 버그를 발견하시면 연락주세요.** (email: xenoz0718@gmail.com)

설치
---

  install using npm :

          $ npm install goorm

공식 사이트
--------

* http://goorm.io
* http://goorm.org

기능 소개
-------

* **자신만의 통합 개발 환경 구축**
* **다양한 플러그인 지원**
* **다른 개발자들과 실시간으로 협업**
* **UI/UML 작성**
* **구문 강조 기능**
* **강력한 검색 및 치환 기능**
* **자신에게 맞은 환경으로 구름을 커스터마이징**
* **Subversion/Git 을 이용한 프로젝트 관리**
* **강력한 터미널 기능**
* **기타 등등**


시작하기
------

* **node.js 설치**

  node.js 설치하기 :

          $ git clone http://github.com/joyent/node.git
          $ cd node
          $ tar -xvzf node-v0.8..tar.gz
          $ cd node-v0.8.2
          $ ./configure
          $ make
          $ sudo make install

  node.js가 정상적으로 설치되었는 지 확인하기 :
  
          $ node -v
          
  노드가 정상적으로 설치되었다면 아래와 같이 버전이 뜹니다. :
  
          $ v0.8.2

  npm 설치 (최신 버전의 node.js는 자동으로 npm을 설치하므로 이 과정은 무시하셔도 됩니다.) :
        
          $ sudo chown -R $USER /usr/local
          $ apt-get install curl
          $ curl http://npmjs.org/install.sh > install.sh
          $ sudo sh install.sh
  
* **다운로드**

  github로부터 소스 다운받기 :

          $ git clone git://github.com/xenoz0718/goorm.git

  svn으로 체크아웃하기 :
  
          $ svn checkout svn://svn.code.sf.net/p/goorm/code/trunk goorm 

  npm으로 설치하기 :

          $ npm install goorm -g
                 

* **실행**

  mongodb 실행하기 :
    
          $ mongod
          
  mongodb가 정상적으로 실행되면 아래와 같은 화면이 뜹니다. :

          ...
          Thu Oct  4 23:26:15 [websvr] admin web console waiting for connections on port 28017
          Thu Oct  4 23:26:15 [initandlisten] waiting for connections on port 27017
          ...
        
  goorm 실행 :
          
          $ node goorm.js start
          
  npm으로 설치했을 시 : 
  
          $ goorm start
          
  데몬으로 실행하고자 한다면 :
  
          $ node goorm.js start -d
          $ goorm start -d
          
  환경설정 (옵션) : 
  
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
          
  구름 종료 : 
  
          $ node goorm.js stop
          $ goorm stop
          
  성공적으로 실행되면 아래와 같은 메시지가 뜹니다.:
  
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
          
  아래 주소로 웹브라우저를 이용해 접근하면 구름을 실행할 수 있습니다. : 
  
          http://localhost:9999
        
라이센스
------
구름은 GPLv3 라이센스를 따르고 있습니다. [GNU General Public License Version 3.0(GPLv3)](http://gplv3.fsf.org/)