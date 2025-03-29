export class User {
    name: string;
    tasks: string[];
    friends: string[];

    constructor(name: string) {
        this.name = name;
        this.tasks = [];
        this.friends = [];
    }
}
