#!/bin/bash

echo "set ignore.list"

if [ -f ignore.list ]
then
        echo "start setting the ignore list from ignore.list for svn"
        svn propset -R svn:ignore -F ignore.list .
        echo "done"
else
        echo "ignore.list not exist"
fi
