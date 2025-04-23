import { fetchData } from "../src/exp/index";

describe("fetchData Function", () => {
    test("should return 'Data loaded' after delay", async () => {
        const data = await fetchData();
        expect(data).toBe("Data loaded");
    });
});
