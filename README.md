# RMIT Capstone project

Capstone project with Financial Planning firm.

## RMIT Project Description

This project involved the creation of a system to provide real-time transaction and account data from open banking APIs in a standard, easily usable format to Financial Planning firms such as our client.

We have also provided a report to our client regarding their options in making use of this data when it becomes available, whether through our system or other providers (including consideration of factors such as cost and security).

The background to this project is the impending Australian Open Banking legislation.  It is anticipated that the Federal Government will require banks to make transaction and account information available via API starting in mid 2019.   This will empower customers to direct their bank to send their data to another provider.  Some banks (such as Macquarie Bank) have already created APIs to allow this.  

## Desired Outcomes

1) Vendor review of the best available solution, including a comparison to an in-house build with open banking API.

2) Proposed interface to money SMART including system cycle i.e. batch runs, down time etc., pseudo code of proposed end-points

3) Proposal for a UI design (expectation is that this should be minimal given it is an interface project).

## Technology Background/Exposure to:

 - New open banking framework
 - JavaScript Front and Back
 - MongoDB
 - Cloud hosted solution

## Installation

This repository consists of two nodejs projects.

/backend contains an express server project that handles API requests to our Open Banking API access handling resource.

/frontend contains a react driven frontend server demonstrating how the above API can be used/implemented.

Please check each respective README for details on how to provision each server.
