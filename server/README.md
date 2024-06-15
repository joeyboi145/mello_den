Mello Den Backend API
=====================

## AUTHENTICATION
* GET           /auth
* PUT           /login 
* PUT           /logout
* PUT           /verify
* POST          /register-user
* DELETE+       /delete-user

## USERS
* GET           /users/:username/profile
* PUT+          /users/:username/edit-profile


## Announcements & EVENTS
**Announcement**
* GET           /announcements
* POST          /announcements/add
* DELETE        /announcements/remove
    
**Calendar Events**
* GET           /calendar/
* POST          /calendar/add
* DELETE        /calendar/remove


## STATS
* GET           /stats/winners
* GET           /stats/calendar
* GET+          /stats/:username/retrieve-form  
* GET+          /stats/:username/check-form
* POST+         /stats/:username/submit
* DELETE+       /stats/:username/delete
