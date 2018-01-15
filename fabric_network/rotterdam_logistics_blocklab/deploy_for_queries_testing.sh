composer archive create --sourceType dir --sourceName . -a rotterdam_logistics_blocklab@0.0.1.bna
composer network update -a rotterdam_logistics_blocklab@0.0.1.bna -c admin@rotterdam_logistics_blocklab

composer network ping --card admin@rotterdam_logistics_blocklab

composer-rest-server -c admin@rotterdam_logistics_blocklab -n never -w true
