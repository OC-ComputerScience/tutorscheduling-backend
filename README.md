# OC Tutor Scheduling Backend

This application allows users to make, book, confirm, and cancel appointments as well as make requests for additional help. It also allows admins to manage students, tutors, locations, and topics for their group as well as view reporting for appointments. This application utilizes the Google API for authentication to ensure a smooth and reliable registration process. It can also authorize use of Google Calendar, so that we can add their appointments to their Google Calendar.

#### Please note:
- You will need to make a **local .env file** with the values specified below.
- You will need to create a database and be able to run it locally.
- This project utilizes **Google Authentication** to allow users to log in.
- You will need to provide a **Client ID from Google** for this project to run locally.

## Project Setup
1. Clone the project.
```
git clone https://github.com/ChloeSheasby/tutorscheduling-node.git
```

2. Install the project.
```
npm install
```

3. Make a local database.
    - Create a schema/database.
    - The sequelize in this project will make all the tables for you.

4. Make sure you have a project registered with the **Google Developer console**.
    - https://console.developers.google.com/
    - Enable **Google+ API** and **Google Analytics API**.
    - Enable an **OAuth consent screen**.
    - Create an **OAuth client ID**.
    - Save your **Client ID** and **Client Secret** in a safe place.

5. Add a local **.env** file and make sure the **client ID** and **client secret** are the values you got from Google. Also make sure that the **database** variables are correct.
    - CLIENT_ID = '**your-google-client-id**'
    - CLIENT_SECRET = '**your-google-client-secret**'
    - DB_HOST = 'localhost'
    - DB_PW = '**your-local-database-password**'
    - DB_USER = '**your-local-database-username**' (usually "root")
    - DB_NAME = '**your-local-database-name**'

6. If you want to enable **texting**, make sure you have a project registered with **Twilio*.
    - https://www.twilio.com/try-twilio
    - Add the following variables to your **.env** file.
       - TWILIO_ACCOUNT_SID
       - TWILIO_AUTH_TOKEN1
       - TWILIO_NUMBER

7. Compile and run the project locally.
```
npm run start
```

8. (Optional) Compile the project for production.
```
npm run build
```

9. (Optional) Lint and fix the project files.
```
npm run lint
```
