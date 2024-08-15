import { config } from "dotenv";
config();

export const interviewers = [
  {
    email: process.env.EMAIL?.replace("@", "+interviewer1@") || "",
    username: process.env.USERNAME + "+interviewer1",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567891",
  },
  {
    email: process.env.EMAIL?.replace("@", "+interviewer2@") || "",
    username: process.env.USERNAME + "+interviewer2",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567892",
  },
  {
    email: process.env.EMAIL?.replace("@", "+interviewer3@") || "",
    username: process.env.USERNAME + "+interviewer3",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567893",
  },
];

export const hiringManagers = [
  {
    email: process.env.EMAIL?.replace("@", "+hiringmanager1@") || "",
    username: process.env.USERNAME + "+hiringmanager1",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567894",
  },
  {
    email: process.env.EMAIL?.replace("@", "+hiringmanager2@") || "",
    username: process.env.USERNAME + "+hiringmanager2",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567895",
  },
  {
    email: process.env.EMAIL?.replace("@", "+hiringmanager3@") || "",
    username: process.env.USERNAME + "+hiringmanager3",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567896",
  },
];

export const applicants = [
  {
    email: process.env.EMAIL?.replace("@", "+applicant1@") || "",
    username: process.env.USERNAME + "+applicant1",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567897",
  },
  {
    email: process.env.EMAIL?.replace("@", "+applicant2@") || "",
    username: process.env.USERNAME + "+applicant2",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567898",
  },
  {
    email: process.env.EMAIL?.replace("@", "+applicant3@") || "",
    username: process.env.USERNAME + "+applicant3",
    password: process.env.PASSWORD || "",
    newPassword: process.env.NEW_PASSWORD || "",
    phone: "+1234567899",
  },
];

export const admin = {
  email: process.env.EMAIL?.replace("@", "+admin@") || "",
  username: process.env.USERNAME + "+admin",
  password: process.env.PASSWORD || "",
  newPassword: process.env.NEW_PASSWORD || "",
  phone: "+1234567890",
};
