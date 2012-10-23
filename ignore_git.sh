#!/bin/bash

echo "set ignore.list"

if [ -f ./.gitignore ]
then
        echo "start setting the ignore list from ~/.gitignore for git"
        git config --global core.excludesfile ~/.gitignore
        cat ./.gitconfig
	echo "done"
else
        echo "./.gitignore not exist"
fi
