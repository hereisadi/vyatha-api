# REST API of Vyatha

## Features:
  - A Hostel Grievances management Web App.

## Getting Started
### Prerequisites

 - NodeJS, NPM, PNPM (https://pnpm.io/installation)
 - A MongoDB server, local or remote.

### Installing

  - Clone the repo and check out the code
  - Run 
    ```
    $ npm install 
    $ npm start
    ```
  - Set following environment variables in a .env file in the root directory
    ``` 
    #jwt secret
    YOUR_SECRET_KEY = <some string> ex: 'mytoughandhardjwtsecret'
        
    #email credentials
    EMAIL = <e-mail address, from which you will be sending the account verification emails to new users> ex:"test@gmail.com"
    EMAIL_PWD = <app passowrd which you can get from google account dashboard> 
       
    #Database server connection URI
    MONGODBSECRET = 'mongodb://<user_name>:<password>@xxxxx.test.com:xxxxx/<db_name>'

    #Frontend website link:
    website = https://example.com

  - Run ``$ npm start`` to start back end on port 8787

## Available Routes

### User Authentication


- Register new user with email

```
Method: POST
Type: public
Route:
/vyatha/api/signup
payload: name && email && password && confirmPassword (subject to change)
```

- Login user with email

```
Method: POST
Type: public
Route:
/vyatha/api/login
payload: email, password
```

- Send Email Verification link

```
Method: POST
Type: Private
Route:
/vyatha/api/sendmagiclink
payload: none
role: all
```

- Verify Email through verify link sent on email
```
Method: PUT
Type: Public
Route: 
/vyatha/api/verifyemail/:token
payload : token as params
```

- Send link to reset password
```
Method: POST
Type: Public
Route: 
/vyatha/api/forgotpassword
payload : email
```

- Verify token to reset password
```
Method: POST
Type: public
Route:
/vyatha/api/resetpassword/:token
payload: password && confirmPassword && token (as params)


```
- Send OTP for email Verification

```
Method: POST
Type: public
Route:
/vyatha/api/sendotp
payload: email
```

- Verify OTP

```
Method: POST
Type: public
Route:
/vyatha/api/verifyotp
payload: email && otp
```

- Edit profile
```
Method: PUT
Type: private
Route:
/vyatha/api/editprofile
role: all ( student, supervisor, warden, dsw, superadmin)
payload : name || newpwd || cnewpwd

```

- Create Issue
```
Method: POST
Type: Private
Route:
/vyatha/api/createissue
role: student
payload : description && photo (subject to change)
```

- Fetch all Issues and Notifications
```
Method: GET
Type: Private
Route:
/vyatha/api/fetchissues
role: student, supervisor, warden, dsw, superadmin

```

- Detailed view of each issue
```
Method: GET
Type: Private
Route:
/vyatha/api/detailedview/:issueId
payload: issueId (as params)
role: student, supervisor, warden, dsw, superadmin

```

- Fetch Issue hostel wise
```
Method: POST
Type: private
Route: /vyatha/api/fetchissuehostelwise
role: superadmin
payload : hostel
```

- Fetch Closed issues
```
Method: GET
Type: Private
Route:
/vyatha/api/fetchclosedissue
role: student, supervisor, warden, dsw, superadmin
payload: none
```

- Fetch all closed issues hostel wise
```
Method: Post
Type: Private
Route:
/vyatha/api/fetchallclosedissuehostelwise
role: superadmin
payload : hostel

```

- Forward Issue
```
Method: PUT
Type : private
payload: issueID && reasonForForwarding && otherID
role = supervisor, warden
Route:
/vyatha/api/forwardissue

```

- Add comment
```

Method: POST 
Type: Private
Payload: issueID as params and commentBody as body (req.body)
role: all
Route:
/vyatha/api/addcomment/:issueID

```

- Get comment
```
Method: GET
Type: Private
Payload: issueID as params
Route:
/vyatha/api/getcomment/:issueID
role: all
```

- Edit Comment
```
Method: PUT
Type:Private
Payload: issueID && commentID as params and commentBody
Route:
/vyatha/api/editcomment/:issueID/:commentID
```

- Approve an issue
```
Method: PUT
Type: Private
role: warden, DSW
Payload: issueID
Route:
/vyatha/api/approveissue

```

- Mark issue as solved
```
Method: PUT
Type: Private
Payload: issueID
Role = supervisor
Route:
/vyatha/api/issuesolved
```

- Close Issue
```
Method: PUT
Type: Private
payload: issueId
Route:
/vyatha/api/closeissue
role = student
```

- Promote role to Supervisor
```
Method: PUT
Type: Private
Payload: accountID
role: superadmin
Route:
/vyatha/api/promotetosupervisor
```

- Promote role to Warden
```
Method: PUT
Type: Private
Payload: accountID
role: superadmin
Route:
/vyatha/api/promotetowarden
```

- Promote role to DSW
```
Method: PUT
Type: Private
Payload: accountID
role: superadmin
Route:
/vyatha/api/promotetodsw
```

- Demote role to Student
```
Method: PUT
Type: Private
Payload: accountID
role: superadmin
Route:
/vyatha/api/demoterole
```

- Get All Accounts
```
Method: GET
Type: Private
role: superadmin
Route:
/vyatha/api/getallaccounts
```

- Delete account
```
Method: DELETE
Type:Private
role: superadmin
Route:
/vyatha/api/deleteaccount
payload:accountID

```

- Check if account exists or not
```
Method: GET
Type: Public
role: all
Route:
/vyatha/api/accountexists/:email
params: email
payload: none

```

- Student can delete their account
```
Method: PUT
Type: private
role: student
Route:
/vyatha/api/studentdeleteaccount
params: none
payload: none

```

-
## Deployment
To deploy on Render, create an account and set up environment variables. Then provide ``pnpm i`` under build command and ``pnpm dev`` under start command.


## Contributing

Please create an issue and start working a feature/ bug you prefer :rocket:.

## License

This project is licensed under GNU GENERAL PUBLIC LICENSE.