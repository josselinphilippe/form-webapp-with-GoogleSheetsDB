# Form-webapp-with-GoogleSheetsDB

# About the bicycle inspection form

JQM web app form for bicycle share mechanics to use in the field.

The idea is to improve on an existing Google form with serious data validation issues and generally poor user experience. Mechanics working on bicycles in the field need to be able to log the following information:

Bike identification (chainstay number)
Station identification 
Nature of inspection or repair
Inventory used


Moving away from the default embedded Google Form option opened the door to dynamic form inputs and geolocation. 

# Reproduce

All thanks owed to Martin Hawksey for great tutorials on getting started with Google Apps Script. 
(https://mashe.hawksey.info/2014/07/google-sheets-as-a-database-insert-with-apps-script-using-postget-methods-with-ajax-example/)

To reproduce this example, create a Google Sheet with desired header fields. Either create a standalone or bound script that includes Sheet identification, user authentication, and a function to create/read/update/delete data. Publish as API and call functions where/when needed in client side javascript. 
