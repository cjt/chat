Chat
====

Sections:
1. Introduction
2. Installation notes
3. Implementation notes
4. Future work TBD

## Introduction

Chat is a simple pseudo-anonymous AngularJs chat room, built as a learning tool to explore AngularJs and CouchDb.

## Installation notes

Modify the database setup script in db/dbsetup.sh to the appropriate $URL and $AUTH parameters, and execute it to create the db and seed the necessary documents. It may be necessary to enable CORS for all domains.

From a terminal in the root directory run 'npm start' to run the server. The default port used is 8000, this can be changed in package.json if required.

Point your browser at localhost:8000, have your friends do so too, and use to your hearts content. If you don't have any friends, point another browser window at it too and pretend you do.

## Implementation notes

The git history will indicate the nature of some of the work done. The core project was based off the AngularJs tutorial so should be reasonably idiomatic. Similarly, the couchdb api docs and guide were used to guide implementation of the views necessary to wire things up.

## Future work TBD

* Retrieval of messages through couchdb _changes api, only pulling down deltas rather than refreshing at intervals.
* Implement user authentication, "private" rooms, adding and removing users to rooms (groups)
* Implement Node.js service to prevent clients talking directly to couchdb.