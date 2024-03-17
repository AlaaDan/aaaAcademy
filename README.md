# Project Documentation

## Overview

This project is a user management and session booking system built with TypeScript and AWS services including DynamoDB, Lambda, and API Gateway. It provides functionalities for both admin and normal users.

## Functionalities

### Admin Users

Admin users have the ability to:

- **Create Sessions**: Admins can create new sessions with specific dates and times.
- **Approve Users**: Admins have the authority to approve user signups.
- **Delete Sessions**: Admins can delete existing sessions.

### Normal Users

Normal users have the ability to:

- **Signup**: Users can create a new account.
- **Login**: Users can login to their account.
- **Change Password**: Users can update their password.
- **Update Contact Information**: Users can update their personal contact information.
- **Book Sessions**: Users can book available sessions.
- **Edit Their Sessions**: Users can modify their booked sessions.
- **Cancel Sessions**: Users can cancel their booked sessions.