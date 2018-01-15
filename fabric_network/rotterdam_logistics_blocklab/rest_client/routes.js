module.exports = function (app) {
  'use strict';

  app.use('/trucker', require('./api/Trucker'));
  app.use('/containerGuy', require('./api/ContainerGuy'));
  app.use('/containerDeliveryJobOffer', require('./api/ContainerDeliveryJobOffer'));
  app.use('/containerDeliveryJob', require('./api/ContainerDeliveryJob'));
  app.use('/test', require('./api/test'));
}