interface Person {
    name: string;
    age: number;
    greet(): string;
}

export class User implements Person {
    constructor(public name: string, public age: number) {}

    greet(): string {
        return `Hello, my name is ${this.name} and I am ${this.age} years old.`;
    }
}

const user = new User("Alice", 25);
console.log(user.greet());

export async function fetchData(): Promise<string> {
    return new Promise((resolve) => setTimeout(() => resolve("Data loaded"), 2000));
}

fetchData().then(console.log);

export default {User, fetchData}