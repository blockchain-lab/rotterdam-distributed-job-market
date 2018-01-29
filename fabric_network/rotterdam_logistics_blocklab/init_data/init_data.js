var request = require('request');
var fs = require('fs');

var headersOpt = {  'content-type': 'application/json' };
var urlBase = 'http://localhost:3000/api/';
var items = ['ContainerInfo', 'ContainerGuy', 'Trucker', 'ContainerDeliveryJobOffer', 'BidOnContainerDeliveryJobOffer'];


for(var i = 0; i < items.length; i++)
{
    var dir = 'data/' + items[i] + '/'; 
    fs.readdirSync(dir).forEach(file => 
    {
        var json = JSON.parse(fs.readFileSync(dir + file, 'utf8'));
        request({
            method:'post',
            url: urlBase + items[i], 
            form: json, 
            headers: headersOpt,
            json: true,
            }, function (error, response, body) 
            {  
                console.log('response: ' + response.statusCode);  
                console.log('error: ' + error); 
                console.log('body: ' + body);      
            }); 
    });
}