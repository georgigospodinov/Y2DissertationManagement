The tests in this folder can be imported into Postman.
( https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en )

They should be executed in the order they appear.
There needs to be a server listening on port 8080.
Start it with 'node main.js' from within the 'src' folder.

NOTE: The authorization tab might appear empty in the GUI but the header is there (in the adjecent tab).

NOTE: If the requests appear out of order -
Order to run:
create student;
create staff;
post dissertation (staff authentication);
update dissertation;
update student;
express interest;
get dissertation by id;
allocate dissertation;
get user by id;
delete user with id;
get user (all);
delete dissertation;
get dissertation (all);

un-allocate dissertation and undo interest expression can be done at almost any time
supervise dissertation can be done for a dissertation not proposed by a member of staff