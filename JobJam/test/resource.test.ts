import { config } from "dotenv";
config();
const endpoint = process.env.MOCK_ENDPOINT_URL;
test("sends GET request to mock endpoint", () => {
	async function testMockEndpoint() {
		const res = await fetch(endpoint || "");
		expect(res.status).toBe(200);
	}
	testMockEndpoint();
});
