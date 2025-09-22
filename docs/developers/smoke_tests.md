# Smoke Testing
Since the development team of Loom is very small at the moment, smoke tests prior to releases are captured here as a manual process.

The goal of this suite is primarily to test front end behavior as judged by the human eye. Are things behaving as expected? Weird errors? Jerky or unresponsive?

To perform the smoke test locally, first start by running
`gro db/create --no-seed`
which will rebuild your local database without any seed data, simulating a freshly installed instance.

# The Script
## Accounts 
1) Right click and check the about section
1) Create a new account (this will be the admin account)
   1) Try to create an account that is not in the format of an email
   1) Try to create an account with a password < 8 chars
1) Name the first actor `alpha`
1) Right click and open the account settings
   1) Mess with the scheme & theme settings
   1) Change the account password
1) Log out then create a new account named `beta`
1) Log out and then log back in as `alpha`
### Admin
## Actors
1) When signed in as `alpha`, create another persona, `adam`.
1) Try to delete actor `alpha`
1) Delete actor `adam`
1) Create another actor `alice`
## Hubs
1) Create a hub named `test`, mess with the initial custom settings
1) Leave the hub
1) Create the `test` hub again & kick yourself
1) Create the `test` hub again
1) Invite `beta` to the hub
## Roles
1) Assign `beta` the steward role
1) Create a new role
## Permissions
1) Test permissions on the new role
## Spaces
1) Create a new space in the `test` hub
1) Delete the space
1) Try and edit a space's name & view
## Entities
//TODO entities (and tie) behavior is complex enough that this is gonna take some more work. Really I just need to document what the state of things is right now.
## Views
//TODO each View is basically going to need it's own set of smoke tests
