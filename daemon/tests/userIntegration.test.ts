import { fetchData } from "../src/index";

describe("fetchData Function", () => {
    test("should return 'Data loaded' after delay", async () => {
        const data = await fetchData();
        expect(data).toBe("Data loaded");
    });
});
