import { config } from "dotenv";

export const jobs = [
	{
		title: "Data Scientist",
		status: "open",
		department: "Data Science",
		location: "Remote",
		type: "Full-time",
		level: "senior-level",
		salaryRange: {
			min: 120000,
			max: 150000,
			currency: "USD",
		},
		jobDescription:
			"As a data scientist, you will be responsible for analyzing large datasets and building predictive models.",
		requiredSkills: ["Python", "Machine Learning", "Statistics"],
		Education: [
			"Bachelor's degree in Data Science",
			"Master's degree in Data Science",
			"PhD in Data Science",
		],
		deadline: "2024-09-30",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567891",
		},
	},
	{
		title: "Marketing Manager",
		status: "open",
		department: "Marketing",
		location: "New York",
		type: "Full-time",
		level: "mid-level",
		salaryRange: {
			min: 80000,
			max: 100000,
			currency: "USD",
		},
		jobDescription:
			"As a marketing manager, you will be responsible for developing and executing marketing strategies.",
		requiredSkills: ["SEO", "Content Marketing", "Analytics"],
		Education: [
			"Bachelor's degree in Marketing",
			"Master's degree in Marketing",
		],
		deadline: "2024-10-15",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567892",
		},
	},
	{
		title: "UX Designer",
		status: "open",
		department: "Design",
		location: "San Francisco",
		type: "Full-time",
		level: "junior-level",
		salaryRange: {
			min: 60000,
			max: 80000,
			currency: "USD",
		},
		jobDescription:
			"As a UX designer, you will be responsible for creating user-friendly interfaces.",
		requiredSkills: ["UI/UX", "Wireframing", "Prototyping"],
		Education: ["Bachelor's degree in Design", "Master's degree in Design"],
		deadline: "2024-10-30",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567893",
		},
	},
	{
		title: "Product Owner",
		status: "open",
		department: "Product",
		location: "Remote",
		type: "Full-time",
		level: "senior-level",
		salaryRange: {
			min: 110000,
			max: 130000,
			currency: "USD",
		},
		jobDescription:
			"As a product owner, you will be responsible for defining product features and prioritizing the product backlog.",
		requiredSkills: ["Product Management", "Agile", "Scrum"],
		Education: [
			"Bachelor's degree in Computer Science",
			"Master's degree in Business Administration",
		],
		deadline: "2024-11-15",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567894",
		},
	},
	{
		title: "Software Engineer",
		status: "open",
		department: "Engineering",
		location: "Remote",
		type: "Full-time",
		level: "mid-level",
		salaryRange: {
			min: 90000,
			max: 110000,
			currency: "USD",
		},
		jobDescription:
			"As a software engineer, you will be responsible for developing and maintaining software applications.",
		requiredSkills: ["JavaScript", "React", "Node.js"],
		Education: [
			"Bachelor's degree in Computer Science",
			"Master's degree in Computer Science",
		],
		deadline: "2024-12-30",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567895",
		},
	},
	{
		title: "Data Scientist",
		status: "open",
		department: "Data Science",
		location: "Remote",
		type: "Full-time",
		level: "senior-level",
		salaryRange: {
			min: 120000,
			max: 150000,
			currency: "USD",
		},
		jobDescription:
			"As a data scientist, you will be responsible for analyzing large datasets and building predictive models.",
		requiredSkills: ["Python", "Machine Learning", "Statistics"],
		Education: [
			"Bachelor's degree in Data Science",
			"Master's degree in Data Science",
			"PhD in Data Science",
		],
		deadline: "2024-09-30",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567891",
		},
	},
	{
		title: "Marketing Manager",
		status: "open",
		department: "Marketing",
		location: "New York",
		type: "Full-time",
		level: "mid-level",
		salaryRange: {
			min: 80000,
			max: 100000,
			currency: "USD",
		},
		jobDescription:
			"As a marketing manager, you will be responsible for developing and executing marketing strategies.",
		requiredSkills: ["SEO", "Content Marketing", "Analytics"],
		Education: [
			"Bachelor's degree in Marketing",
			"Master's degree in Marketing",
		],
		deadline: "2024-10-15",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567892",
		},
	},
	{
		title: "UX Designer",
		status: "open",
		department: "Design",
		location: "San Francisco",
		type: "Full-time",
		level: "junior-level",
		salaryRange: {
			min: 70000,
			max: 90000,
			currency: "USD",
		},
		jobDescription:
			"As a UX designer, you will be responsible for designing user-friendly interfaces.",
		requiredSkills: ["Sketch", "Figma", "Prototyping"],
		Education: ["Bachelor's degree in Design", "Master's degree in Design"],
		deadline: "2024-11-30",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567893",
		},
	},
	{
		title: "Product Owner",
		status: "open",
		department: "Product",
		location: "Austin",
		type: "Full-time",
		level: "mid-level",
		salaryRange: {
			min: 110000,
			max: 130000,
			currency: "USD",
		},
		jobDescription:
			"As a product owner, you will be responsible for managing the product backlog and ensuring the product meets customer needs.",
		requiredSkills: ["Agile", "Scrum", "Roadmapping"],
		Education: ["Bachelor's degree in Business", "Master's degree in Business"],
		deadline: "2024-12-31",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567894",
		},
	},
	{
		title: "DevOps Engineer",
		status: "open",
		department: "Engineering",
		location: "Seattle",
		type: "Full-time",
		level: "mid-level",
		salaryRange: {
			min: 100000,
			max: 120000,
			currency: "USD",
		},
		jobDescription:
			"As a DevOps engineer, you will be responsible for maintaining and optimizing our CI/CD pipeline.",
		requiredSkills: ["AWS", "Docker", "Kubernetes"],
		Education: [
			"Bachelor's degree in Computer Science",
			"Master's degree in Computer Science",
		],
		deadline: "2024-10-31",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567895",
		},
	},
	{
		title: "Customer Support Specialist",
		status: "open",
		department: "Customer Support",
		location: "Remote",
		type: "Full-time",
		level: "entry-level",
		salaryRange: {
			min: 40000,
			max: 50000,
			currency: "USD",
		},
		jobDescription:
			"As a customer support specialist, you will be responsible for providing excellent customer service to our clients.",
		requiredSkills: ["Communication", "Problem-Solving", "CRM"],
		Education: ["Bachelor's degree in any field"],
		deadline: "2024-09-15",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567896",
		},
	},
	{
		title: "Sales Representative",
		status: "open",
		department: "Sales",
		location: "Chicago",
		type: "Full-time",
		level: "mid-level",
		salaryRange: {
			min: 60000,
			max: 80000,
			currency: "USD",
		},
		jobDescription:
			"As a sales representative, you will be responsible for generating leads and closing sales deals.",
		requiredSkills: ["Negotiation", "Lead Generation", "CRM"],
		Education: ["Bachelor's degree in Business", "Master's degree in Business"],
		deadline: "2024-12-01",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567897",
		},
	},
	{
		title: "HR Manager",
		status: "open",
		department: "Human Resources",
		location: "Remote",
		type: "Full-time",
		level: "senior-level",
		salaryRange: {
			min: 90000,
			max: 110000,
			currency: "USD",
		},
		jobDescription:
			"As an HR manager, you will be responsible for managing the HR department and overseeing employee relations.",
		requiredSkills: ["Recruitment", "Employee Relations", "HRIS"],
		Education: [
			"Bachelor's degree in Human Resources",
			"Master's degree in Human Resources",
		],
		deadline: "2024-11-15",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567898",
		},
	},
	{
		title: "Financial Analyst",
		status: "open",
		department: "Finance",
		location: "Boston",
		type: "Full-time",
		level: "mid-level",
		salaryRange: {
			min: 70000,
			max: 90000,
			currency: "USD",
		},
		jobDescription:
			"As a financial analyst, you will be responsible for analyzing financial data and preparing reports.",
		requiredSkills: ["Excel", "Financial Modeling", "Data Analysis"],
		Education: ["Bachelor's degree in Finance", "Master's degree in Finance"],
		deadline: "2024-10-31",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567899",
		},
	},
	{
		title: "Content Writer",
		status: "open",
		department: "Content",
		location: "Remote",
		type: "Full-time",
		level: "junior-level",
		salaryRange: {
			min: 50000,
			max: 60000,
			currency: "USD",
		},
		jobDescription:
			"As a content writer, you will be responsible for creating engaging and informative content for our website and blog.",
		requiredSkills: ["Writing", "SEO", "Research"],
		Education: ["Bachelor's degree in English", "Master's degree in English"],
		deadline: "2024-09-30",
		contact: {
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			phone: "+1234567800",
		},
	},
];
