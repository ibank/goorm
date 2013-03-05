SOURCE_PATH=$1
BUILD_PATH=$2
BUILD_OPTIONS=${*:3}
LIST=`find $SOURCE_PATH -name "*.java"`

javac -cp $SOURCE_PATH -d $BUILD_PATH $BUILD_OPTIONS $LIST

if [ $? -ne 0 ]
then
    echo "Build Fail"
else
    echo "Build Complete"
fi
