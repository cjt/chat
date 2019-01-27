#!/usr/bin/env bash

URL='http://127.0.0.1:5984'
DB='chat'
AUTH='-u admin:dev' # replace auth details as appropriate

STATUS=''

#
# Create a database
#
STATUS=`curl -X PUT $URL/$DB $AUTH -w '%{http_code}' -o /dev/null -s`
#echo $STATUS
if [[ "$STATUS" -eq 201 ]]; then
  echo "Created database..."
else
  echo "Error creating database:" $STATUS
  exit -1
fi

#
# Post some documents
#
STATUS=`curl -X POST $URL/$DB -d '{"room":"Room 1","user":"cjt","datetime":"2019-01-23 10:32:22.234","message":"Anyone about this morning?"}' -H 'Content-Type:application/json' $AUTH -o /dev/null -w '%{http_code}' -s`
if [[ "$STATUS" -ne 201 ]]; then
  echo "Error posting data:" $STATUS
  exit -1
fi

STATUS=`curl -X POST $URL/$DB -d '{"room":"Room 1","user":"dave","datetime":"2019-01-23 10:33:58.987","message":"Hey good morning."}' -H 'Content-Type:application/json' $AUTH -o /dev/null -w '%{http_code}' -s`
if [[ "$STATUS" -ne 201 ]]; then
  echo "Error posting data:" $STATUS
  exit -1
fi

STATUS=`curl -X POST $URL/$DB -d '{"room":"Room 2","user":"bill","datetime":"2019-01-23 10:21:34.827","message":"Arr me hearties."}' -H 'Content-Type:application/json' $AUTH -o /dev/null -w '%{http_code}' -s`
if [[ "$STATUS" -ne 201 ]]; then
  echo "Error posting data:" $STATUS
  exit -1
fi

# Create the rooms view
STATUS=`curl -X PUT $URL/$DB/_design/rooms -d '{"_id":"_design/rooms","views":{"rooms":{"reduce":"function (keys, values, rereduce){ return sum(values); }","map":"function (doc) { if (doc.room) { emit(doc.room, 1); } }" } }, "language": "javascript" }' -H 'Content-Type: application/json' $AUTH -o /dev/null -w '%{http_code}' -s`
if [[ "$STATUS" -eq 201 ]]; then
  echo "Created rooms view"
else
  echo "Error creating rooms view:" $STATUS
  exit -1
fi

# Create the messages view
STATUS=`curl -X PUT $URL/$DB/_design/messages -d '{"_id": "_design/messages", "views": { "messages": { "map": "function (doc) { if (doc.room) { emit(doc.room, null); } }" } }, "language": "javascript" }' -H 'Content-Type: application/json' $AUTH -o /dev/null -w '%{http_code}' -s`
if [[ "$STATUS" -eq 201 ]]; then
  echo "Created messages view"
else
  echo "Error creating messages view:" $STATUS
  exit -1
fi

# Create the room filter
STATUS=`curl -X PUT $URL/$DB/_design/filters -d '{ "_id": "_design/filters", "filters": { "room": "function (doc, req) { if (doc.room && req.query.room && doc.room == req.query.room) { return true; } else { return false; } }" } }' -H 'Content-Type: application/json' $AUTH -o /dev/null -w '%{http_code}' -s`
if [[ "$STATUS" -eq 201 ]]; then
  echo "Created room filter"
else
  echo "Error creating room filter:" $STATUS
  exit -1
fi

# Query for all rooms and count of messages in them
#curl -X GET http://127.0.0.1:5984/chat1/_design/rooms/_view/rooms?group=true

# Get messages for room - TODO should bound, e.g. last 100 messages
#curl -X GET "http://127.0.0.1:5984/chat1/_design/messages/_view/messages?key=%22Mountain%20Rescue%22&include_docs=true"

#
# Enable CORS for all domains!
#

exit 0;

