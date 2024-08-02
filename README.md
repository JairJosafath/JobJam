# JobJam - Serverless Hiring System

Welcome to the JobJam repository! JobJam is a serverless CMS built using AWS
services to streamline and improve the hiring process for companies. This system
is designed to be scalable, cost-effective, and easy to integrate with your
existing frontend applications. For a detailed overview of the project, you can
view the notion page
[here](https://neighborly-airport-3a6.notion.site/Serverless-CMS-JamJob-v2-e6b87b25c4d84af8bd60b41e642be629?pvs=4)

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Setup Instructions](#setup-instructions)
6. [Usage](#usage)
7. [Testing](#testing)
8. [Contributing](#contributing)
9. [License](#license)

## Overview

JobJam leverages AWS serverless services to provide a backend solution for
managing job applications. With a focus on scalability and cost-efficiency,
JobJam eliminates the need for managing servers, allowing your team to
concentrate on critical business processes.

## Features

- **Job Listings Management**: Create, update, and delete job listings.
- **Application Submission**: Applicants can submit their applications to job
  postings.
- **Application Review**: Hiring managers can review and manage applications.
- **Interview Scheduling**: Schedule and manage interviews with applicants.
- **Offer Management**: Manage job offers and notifications.
- **Role-Based Access Control**: Different roles (Applicant, Interviewer, Hiring
  Manager) with appropriate access levels.

## Tech Stack

- **AWS API Gateway**: REST API management.
- **AWS DynamoDB**: NoSQL database for storing job and application data.
- **AWS S3**: Storage for static assets.
- **AWS Cognito**: User authentication and authorization.
- **AWS SES and SNS**: Email and SMS notifications.
- **AWS CDK**: Infrastructure as Code for deploying AWS resources.

## Architecture

<!-- image -->

![Architecture Diagram](img/Untitled.png)

<!-- explanation -->

1. Cognito authenticates every request made via API gateway
2. Requests get transformed with VTLs based on the authentication and passed on
   to AWS services and the services can send data back to the user
3. On Certain DynamoDB changes, Lambda will notify users by using the emailing
   service

The architecture uses a single DynamoDB table with a composite primary key
(partition key and sort key) to efficiently manage the different entities within
the system. Below is a simplified overview of the architecture:

- **DynamoDB Table**:
  - **Partition Key (PK)**: `DEPARTMENT#<departmentId>`
  - **Sort Key (SK)**: Various combinations based on the entity type (e.g.,
    `JOB#<jobId>`, `APPLICATION#<applicationId>`, etc.)

## Setup Instructions

### Prerequisites

- AWS CLI
- AWS CDK
- Node.js and npm

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/JobJam.git
   cd JobJam
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure AWS CLI**:

   ```bash
   aws configure
   ```

4. **Deploy the infrastructure**:

   ```bash
   cdk deploy
   ```

5. **Set up environment variables**: Create a `.env` file in the root directory
   and add the necessary configuration (e.g., Cognito User Pool ID, etc.).

## Usage

### API Endpoints

- **Create Job Listing**: `POST /jobs`
- **Get Job Listings**: `GET /jobs`
- **Submit Application**: `POST /applications`
- **Review Application**: `GET /applications/{applicationId}`
- **Schedule Interview**: `POST /interviews`
- **Manage Offers**: `POST /offers`

### User Roles

- **Applicant**: Can view job listings and submit applications.
- **Interviewer**: Can review applications and manage interviews.
- **Hiring Manager**: Can create job listings, review applications, schedule
  interviews, and manage offers.

## Testing

### VTL Templates

Due to limited support for testing VTL templates, manual testing and systematic
template building will be used. Follow these steps to test VTL templates:

1. Understand the AWS resource APIs.
2. Build and test lightweight VTL templates.
3. Use a consistent output in CDK code.

### API Testing

1. Understand user behaviors and API requests.
2. Build test data and expected return values.
3. Use a testing library (e.g., Jest) to automate testing.
4. Write code to mimic user behaviors and run tests on changes.

## Contributing

We welcome contributions! Please read our
[Contributing Guidelines](CONTRIBUTING.md) before submitting any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file
for details.
