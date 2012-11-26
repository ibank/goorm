#!/bin/bash

USAGE="./export.sh -t [git|release] -v [goorm_version] -r [current_revision]"

TARGET="release"
VERSION="1.0.0"
REVISION="0"

EXPORT_DIR="../release/goorm_export"
RELEASE_DIR="../release/goorm"


while getopts ":t:v:r:" OPT; do
    case "$OPT" in
        t)
            TARGET=$OPTARG
            ;;
        v)
            VERSION=$OPTARG
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


echo "Starting goormIDE export..."
echo "--------------------------------------------------------"

echo "EXPORTING: Export Files..."

rm -rf $EXPORT_DIR
mkdir $EXPORT_DIR

svn --force export ./ $EXPORT_DIR

echo "EXPORTING: Done."

echo ""
echo "Starting goormIDE:all-in-one release..."
echo "--------------------------------------------------------"

rm -rf ../release
mkdir ../release
mkdir $RELEASE_DIR

echo "COPYING: Copy Files..."
cp -R `ls $EXPORT_DIR | grep -v temp_files | grep -v workspace` $RELEASE_DIR
mkdir $RELEASE_DIR/workspace
mkdir $RELEASE_DIR/temp_files
echo "COPYING: Done."

echo "UGLIFY: Compress start!"
echo "UGLIFY: ${RELEASE_DIR}/goorm.js"
uglifyjs -o $RELEASE_DIR/goorm.js $RELEASE_DIR/goorm.js

for name in $(find $RELEASE_DIR/modules -name "*.js" ); do

	uglifyjs -o $name --overwrite $name
	echo "UGLIFY: ${name}"
	
done

for name in $(find $RELEASE_DIR/public/modules -name "*.js"); do

	uglifyjs -o $name --overwrite $name
	echo "UGLIFY: ${name}"
	
done

for name in $(find $RELEASE_DIR/plugins -name "*.js"); do

	uglifyjs -o $name --overwrite $name
	echo "UGLIFY: ${name}"
	
done

echo "Compressing goormIDE release..."
echo "--------------------------------------------------------"

echo "COMRESSING: goorm.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.v$VERSION.r$REVISION.zip $RELEASE_DIR/*

echo "COMRESSING: goorm.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.v$VERSION.r$REVISION.tar.gz $RELEASE_DIR/*
gzip ../release/goorm.v$VERSION.r$REVISION.tar.gz


echo "Compressing goormIDE:nodejs release..."
echo "--------------------------------------------------------"

mkdir ${RELEASE_DIR}_nodejs
cp -R `ls $RELEASE_DIR | grep -v plugins` ${RELEASE_DIR}_nodejs
mkdir ${RELEASE_DIR}_nodejs/plugins
cp -R ${RELEASE_DIR}/plugins/org.goorm.plugin.nodejs ${RELEASE_DIR}_nodejs/plugins/

echo "COMRESSING: goorm.nodejs.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.nodejs.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.nodejs.v$VERSION.r$REVISION.zip ${RELEASE_DIR}_nodejs/*

echo "COMRESSING: goorm.nodejs.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.nodejs.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.nodejs.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.nodejs.v$VERSION.r$REVISION.tar.gz ${RELEASE_DIR}_nodejs/*
gzip ../release/goorm.nodejs.v$VERSION.r$REVISION.tar.gz


echo "Compressing goormIDE:cpp release..."
echo "--------------------------------------------------------"

mkdir ${RELEASE_DIR}_cpp
cp -R `ls $RELEASE_DIR | grep -v plugins` ${RELEASE_DIR}_cpp
mkdir ${RELEASE_DIR}_cpp/plugins
cp -R ${RELEASE_DIR}/plugins/org.goorm.plugin.cpp ${RELEASE_DIR}_cpp/plugins/

echo "COMRESSING: goorm.cpp.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.cpp.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.cpp.v$VERSION.r$REVISION.zip ${RELEASE_DIR}_cpp/*

echo "COMRESSING: goorm.cpp.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.cpp.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.cpp.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.cpp.v$VERSION.r$REVISION.tar.gz ${RELEASE_DIR}_cpp/*
gzip ../release/goorm.cpp.v$VERSION.r$REVISION.tar.gz


echo "Compressing goormIDE:java release..."
echo "--------------------------------------------------------"

mkdir ${RELEASE_DIR}_java
cp -R `ls $RELEASE_DIR | grep -v plugins` ${RELEASE_DIR}_java
mkdir ${RELEASE_DIR}_java/plugins
cp -R ${RELEASE_DIR}/plugins/org.goorm.plugin.java ${RELEASE_DIR}_java/plugins/

echo "COMRESSING: goorm.java.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.java.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.java.v$VERSION.r$REVISION.zip ${RELEASE_DIR}_java/*

echo "COMRESSING: goorm.java.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.java.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.java.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.java.v$VERSION.r$REVISION.tar.gz ${RELEASE_DIR}_java/*
gzip ../release/goorm.java.v$VERSION.r$REVISION.tar.gz


echo "Compressing goormIDE:web release..."
echo "--------------------------------------------------------"

mkdir ${RELEASE_DIR}_web
cp -R `ls $RELEASE_DIR | grep -v plugins` ${RELEASE_DIR}_web
mkdir ${RELEASE_DIR}_web/plugins
cp -R ${RELEASE_DIR}/plugins/org.goorm.plugin.web ${RELEASE_DIR}_web/plugins/

echo "COMRESSING: goorm.web.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.web.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.web.v$VERSION.r$REVISION.zip ${RELEASE_DIR}_web/*

echo "COMRESSING: goorm.web.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.web.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.web.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.web.v$VERSION.r$REVISION.tar.gz ${RELEASE_DIR}_web/*
gzip ../release/goorm.web.v$VERSION.r$REVISION.tar.gz


echo "Compressing goormIDE:jsp release..."
echo "--------------------------------------------------------"

mkdir ${RELEASE_DIR}_jsp
cp -R `ls $RELEASE_DIR | grep -v plugins` ${RELEASE_DIR}_jsp
mkdir ${RELEASE_DIR}_jsp/plugins
cp -R $RELEASE_DIR/plugins/org.goorm.plugin.jsp ${RELEASE_DIR}_jsp/plugins/

echo "COMRESSING: goorm.jsp.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.jsp.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.jsp.v$VERSION.r$REVISION.zip ${RELEASE_DIR}_jsp/*

echo "COMRESSING: goorm.jsp.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.jsp.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.jsp.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.jsp.v$VERSION.r$REVISION.tar.gz ${RELEASE_DIR}_jsp/*
gzip ../release/goorm.jsp.v$VERSION.r$REVISION.tar.gz


echo "Compressing goormIDE:php release..."
echo "--------------------------------------------------------"

mkdir ${RELEASE_DIR}_php
cp -R `ls $RELEASE_DIR | grep -v plugins` ${RELEASE_DIR}_php
mkdir ${RELEASE_DIR}_php/plugins
cp -R $RELEASE_DIR/plugins/org.goorm.plugin.php ${RELEASE_DIR}_php/plugins/

echo "COMRESSING: goorm.php.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.php.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.php.v$VERSION.r$REVISION.zip ${RELEASE_DIR}_php/*

echo "COMRESSING: goorm.php.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.php.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.php.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.php.v$VERSION.r$REVISION.tar.gz ${RELEASE_DIR}_php/*
gzip ../release/goorm.php.v$VERSION.r$REVISION.tar.gz


echo "Compressing goormIDE:go release..."
echo "--------------------------------------------------------"

mkdir ${RELEASE_DIR}_go
cp -R `ls $RELEASE_DIR | grep -v plugins` ${RELEASE_DIR}_go
mkdir ${RELEASE_DIR}_go/plugins
cp -R $RELEASE_DIR/plugins/org.goorm.plugin.go ${RELEASE_DIR}_go/plugins/

echo "COMRESSING: goorm.go.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.go.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.go.v$VERSION.r$REVISION.zip ${RELEASE_DIR}_go/*

echo "COMRESSING: goorm.go.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.go.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.go.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.go.v$VERSION.r$REVISION.tar.gz ${RELEASE_DIR}_go/*
gzip ../release/goorm.go.v$VERSION.r$REVISION.tar.gz


echo "Compressing goormIDE:dart release..."
echo "--------------------------------------------------------"

mkdir ${RELEASE_DIR}_dart
cp -R `ls $RELEASE_DIR | grep -v plugins` ${RELEASE_DIR}_dart
mkdir ${RELEASE_DIR}_dart/plugins
cp -R $RELEASE_DIR/plugins/org.goorm.plugin.dart ${RELEASE_DIR}_dart/plugins/

echo "COMRESSING: goorm.dart.v${VERSION}.r${REVISION}.zip"
rm -f ../release/goorm.dart.v$VERSION.r$REVISION.zip
zip -r ../release/goorm.dart.v$VERSION.r$REVISION.zip ${RELEASE_DIR}_dart/*

echo "COMRESSING: goorm.dart.v${VERSION}.r${REVISION}.tar.gz"
rm -f ../release/goorm.dart.v$VERSION.r$REVISION.tar
rm -f ../release/goorm.dart.v$VERSION.r$REVISION.tar.gz
tar -cvf ../release/goorm.dart.v$VERSION.r$REVISION.tar.gz ${RELEASE_DIR}_dart/*
gzip ../release/goorm.dart.v$VERSION.r$REVISION.tar.gz

exit 0