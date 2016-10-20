#! /bin/bash

cd cache && find . -print | zip ../cache.zip -@
