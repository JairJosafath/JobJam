import { config } from "dotenv";
config();

const endpoint = process.env.API_ENDPOINT;

test("admin can login and create a hiring manager", async () => {
	const res = await fetch(endpoint + "auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "test-admin",
			password: process.env.PASSWORD,
		}),
	});
	const data = await res.json();
	if (res.status === 200) {
		console.log("Test admin logged in successfully");
		expect(res.status).toBe(200);
	} else {
		console.log("Test admin login failed");
		console.log(await res.json());
		expect(res.status).toBe(200);
	}

	const resHiringManager = await fetch(endpoint + "admin/hiring-manager", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: data.AuthenticationResult.IdToken,
		},
		body: JSON.stringify({
			username: "test-hiring-manager",
			department: "Engineering",
			email: process.env.EMAIL?.replace("@", "+hiringmanager@"),
			password: process.env.PASSWORD,
		}),
	});
	const dataHiringManager = await resHiringManager.json();
	if (resHiringManager.status === 200) {
		console.log("Test hiring-manager created successfully");
		expect(resHiringManager.status).toBe(200);
	} else {
		console.log("Test hiring-manager creation failed");
		console.log(dataHiringManager);
		expect(resHiringManager.status).toBe(200);
	}
});
