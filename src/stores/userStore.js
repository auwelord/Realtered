import { defineStore } from "pinia";

export const userStore = defineStore("user", {
    state: () => {
        return {
            discord_token: "",
            refresh_token: "",
            discord_user: {},
        };
    },
    actions: {
        connect(discord_token, refresh_token, discord_user) {
            this.discord_token = discord_token;
            this.discord_user = discord_user;
            this.refresh_token = refresh_token;
        },
        disconnect() {
            this.discord_user = {};
            this.discord_token = "";
            this.discord_user = "";

            // Perform logout logic
            localStorage.removeItem('lastVisitedPage');
        },
        isConnected() {
            console.log(this.id);
            return this.id !== "" && this.discordToken !== "";
        }
        ,
        isDisconnected() {
            return !this.isConnected();
        }
    },
    getters: {
        name: (state) => {
            return state.discord_user.username;
        },
        email: (state) => {
            return state.discord_user.email;
        },
        discordToken: (state) => {
            return state.discord_token;
        },
        refreshToken: (state) => {
            return state.refresh_token;
        },
        id: (state) => {
            return state.discord_user.id;
        }
    },
    persist: {
        storage: sessionStorage, // data in sessionStorage is cleared when the page session ends.
    },
});
