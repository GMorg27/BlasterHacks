import { Notification } from "./notification.ts";

export class User {
    name: string;
    tasks: string[];
    friends: string[];
    notifications: Notification[];
    stars: number;

    constructor(name: string) {
        this.name = name;
        this.tasks = [];
        this.friends = [];
        this.notifications = [];
        this.stars = 0;
    }
}
