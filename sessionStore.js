class Storage {
    constructor() {
        this.data = new Map();
    }

    key(n) {
        return [...this.data.keys()][n];
    }
    findSession(key) {
        return this.data.get(key);
    }
    get length() {
        return this.data.size;
    }

    saveSession(key, value) {
        this.data.set(key, value);
    }
    deleteSession(key) {
        this.data.delete(key);
    }
    clear() {
        this.data = new Map();
    }
    findAllSessions(){
        return [...this.data.values()];
    }

}

let sessionStorage = globalThis.sessionStorage = globalThis.sessionStorage ?? new Storage();

module.exports = { Storage, sessionStorage };
