for name in $(find . -name ".DS_Store*"); do
rm -rf $name
echo $name
done

