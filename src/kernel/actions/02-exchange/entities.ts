import { ActionCategory, ActionEntry } from "../../types";
import { FetchTransportHandler } from "./FetchTransport";

export const FetchTransportEntry: ActionEntry = {
    name: 'FetchTransport',
    category: ActionCategory.EXCHANGE,
    description: 'Fetch transport data from remote server',
    offset: 100,
    handler: FetchTransportHandler
};