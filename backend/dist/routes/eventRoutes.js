"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventControllers_1 = require("../controllers/eventControllers");
const router = express_1.default.Router();
router.get('/events/:userId', eventControllers_1.fetchWorkoutEvents);
router.delete('/:userId/past-events', eventControllers_1.removePastEvents);
exports.default = router;
