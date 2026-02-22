// Simple in-memory mock to simulate Firestore when credentials are missing
class MockCollection {
    constructor(name) {
        this.name = name;
        this.data = new Map();
    }

    where(field, op, value) {
        return {
            get: async () => {
                const matches = Array.from(this.data.values()).filter(item => item[field] === value);
                return {
                    empty: matches.length === 0,
                    docs: matches.map(item => ({
                        id: item.id,
                        data: () => item
                    })),
                };
            }
        };
    }

    doc(id) {
        const item = this.data.get(id);
        return {
            get: async () => ({
                exists: this.data.has(id),
                id: id,
                data: () => this.data.get(id)
            }),
            set: async (data) => this.data.set(id, { ...data, id }),
            update: async (updates) => this.data.set(id, { ...this.data.get(id), ...updates }),
            delete: async () => this.data.delete(id),
        };
    }

    async add(data) {
        const id = Math.random().toString(36).substring(7);
        const newItem = { ...data, id };
        this.data.set(id, newItem);
        return { id, data: () => newItem };
    }

    async get() {
        return {
            size: this.data.size,
            docs: Array.from(this.data.values()).map(item => ({
                id: item.id,
                data: () => item
            })),
        };
    }
}

class MockDb {
    constructor() {
        this.collections = {};
    }
    collection(name) {
        if (!this.collections[name]) this.collections[name] = new MockCollection(name);
        return this.collections[name];
    }
    async runTransaction(callback) {
        // Basic transaction mock
        const t = {
            get: async (ref) => ref.get(),
            set: (ref, data) => ref.set(data),
            update: (ref, data) => ref.update(data),
        };
        return callback(t);
    }
}

export const mockDb = new MockDb();

export const mockAuth = {
    // Not used in controllers directly but exported for completeness
};
