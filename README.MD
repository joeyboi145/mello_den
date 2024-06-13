

The Mello Den
==================
A fun little side project for the Stony Brook Mellophone Section to encourage 
good health choices and fun throughout Preseason and the semester.


## Systems:

### Stats System	

Scores individuals based on:
- Hydration: Scale from 1-10 (Weight 2)
- Meals taken: 2 (Weight 20)
- Hours of sleep: 8 hrs (Weight 3)
- Sunscreen:  4 times (Weight 2)

**MAX SCORE**: 92


Extra credit:
- Breakfast: 1 pt
- Extra Sleep: 1 pt per hour
- Step Counter? (Rebalance Grading)



### Mello Food Review System
East Side Dinning Food Review
- Leave food description
- Leave a star rating


## Design:
### Stats System:
* Winner is declared at the end of the day
* Logged in Users can edit their qualifying information throughout the day.
* Shoutout Menu for those who walked the most, perfect sunscreen, ate breakfast first.
* Win Calendar for the week.

### Food Review System:
* Logged in Users can leave a review
* Other Users can leave up votes on reviews
* The best review will leave a shoutout at the end of the day

### Users: 
* Registration Page where users can register their own username and password.
* Profile Page with user statistics and food reviews displayed.
* Account Required for users add data
* Account Required for users to leave food reviews
* Admin user to tweak scoring algorithm and delete data
* PLEASE SECURE this portal to prevent data breaches




Application Components:
========================


1. Frontend Web Server Framework: React
2. Server API Framework: Node.JS
3. Backend Database: MySQL


## Database Structure: MySQL

**DATABASE NAME**: mello_den

``
USER {
username: STR,
email: STR,
password: STR,
verified: BOOL,
admin: BOOL,
year: INT,
… (more user details) …
average_stat: DOUBLE
win_hydration: INT,
win_sunscreen: INT,
win_breakfast: INT
}
``

``
STAT {
completed_by: OBJ_ID,
hydration_level: INT,
meals: INT,
sleep: INT,
sunscreen: INT,
time: DATE,
complete: BOOL
}	
``

``
REVIEW {
reviewed_by: OBJ_ID,
score: DOUBLE,
time: DATE,
picture: BLOB,
text: STR,
votes: INT
}
``



## Development Plan: 
**DEADLINE FOR FUNCTIONALITY except Food Review**:
		
June 30th
=========


**DEADLINE FOR DESIGN & FOOD REVIEW**:


August 10th
=========

