export class User {
    name: string;
    tasks: string[]

    constructor(name: string) {
        this.name = name;
        this.tasks = [];
    }
}
