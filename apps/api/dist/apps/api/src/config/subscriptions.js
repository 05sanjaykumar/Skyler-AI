"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionConfig = void 0;
// apps/api/src/config/subscriptions.ts
exports.subscriptionConfig = {
    free: {
        maxInstances: 2,
        monthlyPrompts: 15,
    },
    pro: {
        maxInstances: 3,
        monthlyPrompts: 100,
    },
    premium: {
        maxInstances: 5,
        monthlyPrompts: 300,
    },
};
