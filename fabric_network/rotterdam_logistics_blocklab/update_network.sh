#!/bin/bash
./make_archive.sh
composer network update -c admin@rotterdam_logistics_blocklab -a rotterdam_logistics_blocklab@0.0.1.bna
