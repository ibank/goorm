#!/bin/sh

USAGE="./export.sh -t [git|release|zip|tar|npm] -v [goorm version] -r [current revision]"

while getopts tvr: OPT; do
    case "$OPT" in
        t)
            TARGET=$OPTARG
            exit 0
            ;;
        v)
            VERSION=$OPTARG
            exit 0
            ;;
        r)
            REVISION=$OPTARG
            ;;
        \?)
            # getopts issues an error message
            echo $USAGE >&2
            exit 1
            ;;
    esac
done

if [$TARGET = "git"] then

	mkdir ./to_git
	git clone https://github.com/xenoz0718/goorm.git ./to_git/
	svn --force export ./ ./to_git/

	echo "set ignore.list"
	
	cd ./to_git
	
	if [ -f ./.gitignore ] then
        echo "start setting the ignore list from ./.gitignore for git"
        git config --global core.excludesfile ./.gitignore
        cat ./.gitconfig
		echo "done"
	else
		echo "./.gitignore not exist"
	fi

	git add *
	git commit -m "new features!"
	git push
	
elif [$TARGET = "release"]

	rm -rf ./release
	mkdir ./release
	echo "copy files"
	cp -R `ls ./ | grep -v release | grep -v workspace` ./release
	mkdir ./release/workspace
	echo "done."
	
	echo "compress start!"
	echo "goorm.js"
	uglifyjs -o ./release/goorm.js ./release/goorm.js
	
	for name in $(find ./release/modules/ -name "*.js" ); do
	uglifyjs -o $name --overwrite $name
	echo $name
	done
	
	for name in $(find ./release/public/modules/ -name "*.js"); do
	uglifyjs -o $name --overwrite $name
	echo $name
	done
	
	for name in $(find ./release/plugins -name "*.js"); do
	uglifyjs -o $name --overwrite $name
	echo $name
	done
	
elif [$TARGET = "zip"] 

	zip -r goorm.v$VERSION.r$REVISION.zip ./release/
	
elif [$TARGET = "tar"] 

	tar -zcvf goorm.v$VERSION.r$REVISION.tar.gz ./release/
	
elif [$TARGET = "npm"] 
	
else
	
fi