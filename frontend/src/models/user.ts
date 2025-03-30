import { Notification } from "./notification.ts";

export class User {
    name: string;
    tasks: string[];
    friends: string[];
    notifications: Notification[];

    constructor(name: string) {
        this.name = name;
        this.tasks = [];
        this.friends = [];
        this.notifications = [];
    }
}
