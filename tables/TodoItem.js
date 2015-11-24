// ----------------------------------------------------------------------------
// Copyright (c) 2015 Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

/*
** Sample Table Definition - this supports the Azure Mobile Apps
** TodoItem product with authentication and offline sync
*/
var azureMobileApps = require('azure-mobile-apps'),
	logger = require('azure-mobile-apps/src/logger');

// Create a new table definition
var table = azureMobileApps.table();

// READ - only return records belonging to the authenticated user
table.read(function (context) {
  context.query.where({ userId: context.user.id });
  return context.execute();
});

// CREATE - add or overwrite the userId based on the authenticated user
table.insert(function (context) {
	context.item.userId = context.user.id;

    var payload = '<toast><visual><binding template="Toast01"><text id="1">Inserted item</text></binding></visual></toast>';
    
    return context.execute()
        .then(function (results) {
            if (context.push) {
                context.push.wns.send(null, payload, 'wns/toast', function (error) {
                    if (error) {
                        logger.error('Error while sending push notification: ', error);
                    } else {
                        logger.silly('Push notification sent successfully!');
                    }
                });
            }
			// we want to return the results immediately, the result of the push 
			// notification does not affect the result of the REST API call
            return results;
        });
        // .catch(function (error) {
        //     logger.error('Error while running context.execute: ', error);
        // });
});

// UPDATE - for this scenario, we don't need to do anything - this is
// the default version
//table.update(function (context) {
//  return context.execute();
//});

// DELETE - for this scenario, we don't need to do anything - this is
// the default version
// table.delete(function (context) {
//   return context.execute();
// });

// Finally, export the table to the Azure Mobile Apps SDK - it can be
// read using the azureMobileApps.tables.import(path) method

module.exports = table;