# System Concepts
This doc is a grab bag of general system ideas that don't quite deserve an article of their own.

## Websockets & Broadcasts
Loom runs both a standard HTTP Rest endpoint for its services as well as allowing for Websocket connections. This means that when the standard front end is running, it can maintaing a connection to the server and receive updates about server state without refreshing.

The `mutations` framework primarily exists to manage this state on the front end.

The `broadcast` system manages who to send these updates to on the backend.

## Tasks
Loom has implemented a framework for allowing Admins to directly run arbitary Node scripts on their servers called `tasks`. They may only be invoked by Admins from the front end. Currently the only way to add new Tasks is to have them bundled into final package directly in the source code.

## Ui
In addition to the discrete Views within the plugin package, there are a number of more generic Ui features and functions available for use within Views. These should probably be better organized.