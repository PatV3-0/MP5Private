import fs from "fs";
import path from "path";
import is_running from "../src/singleton";

jest.mock("fs");

const LOCK_FILE = path.join(__dirname, "../src/singleton.lock");

describe("is_running - Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should return true if lock file exists and process is running", () => {
        jest.spyOn(fs, "existsSync").mockReturnValue(true);
        jest.spyOn(fs, "readFileSync").mockReturnValue("12345");
        //jest.spyOn(process, "kill").mockImplementation(() => {});
        
        expect(is_running()).toBe(true);
    });

    test("should remove stale lock file if process is not running", () => {
        jest.spyOn(fs, "existsSync").mockReturnValue(true);
        jest.spyOn(fs, "readFileSync").mockReturnValue("99999");
        jest.spyOn(process, "kill").mockImplementation(() => { throw new Error(); });
        const unlinkSpy = jest.spyOn(fs, "unlinkSync").mockImplementation(() => {});
        
        expect(is_running()).toBe(false);
        expect(unlinkSpy).toHaveBeenCalledWith(LOCK_FILE);
    });

    test("should create lock file if not present", () => {
        jest.spyOn(fs, "existsSync").mockReturnValue(false);
        const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
        
        expect(is_running()).toBe(false);
        expect(writeSpy).toHaveBeenCalledWith(LOCK_FILE, expect.any(String));
    });
});