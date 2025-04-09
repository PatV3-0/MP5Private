import { User, fetchData } from '../src/index';  

describe('User class', () => {
  test('should correctly greet the user', () => {
    const user = new User('Alice', 25);
    expect(user.greet()).toBe('Hello, my name is Alice and I am 25 years old.');
  });

  test('should create a user with the correct name and age', () => {
    const user = new User('Bob', 30);
    expect(user.name).toBe('Bob');
    expect(user.age).toBe(30);
  });
});

describe('fetchData function', () => {
  test('should resolve with "Data loaded" after 2 seconds', async () => {
    jest.setTimeout(3000); // Allow time for the async function to complete
    const data = await fetchData();
    expect(data).toBe('Data loaded');
  });
});
