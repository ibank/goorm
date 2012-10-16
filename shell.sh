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
