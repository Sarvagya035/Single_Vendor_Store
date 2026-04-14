import { Shipment } from "../models/shipment.model.js";
import { syncShipmentFromDhl, syncTestShipment } from "../services/dhl.service.js";

const DEFAULT_POLL_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_INITIAL_DELAY_MS = 15 * 1000;
const FINAL_STATUSES = ["Delivered", "Exception"];

let pollerStarted = false;
let pollerTimer = null;
let initialDelayTimer = null;
let isPolling = false;

const getPollIntervalMs = () => {
    const value = Number(process.env.SHIPMENT_POLL_INTERVAL_MS);
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_POLL_INTERVAL_MS;
};

const getInitialDelayMs = () => {
    const value = Number(process.env.SHIPMENT_POLL_INITIAL_DELAY_MS);
    return Number.isFinite(value) && value >= 0 ? value : DEFAULT_INITIAL_DELAY_MS;
};

const syncShipment = async (shipment) => {
    if (shipment.isTestMode || process.env.DELIVERY_MODE !== "production") {
        return syncTestShipment(shipment);
    }

    return syncShipmentFromDhl(shipment);
};

const pollOpenShipments = async () => {
    if (isPolling) {
        return;
    }

    isPolling = true;

    try {
        const shipments = await Shipment.find({
            shipmentStatus: { $nin: FINAL_STATUSES }
        });

        if (!shipments.length) {
            return;
        }

        for (const shipment of shipments) {
            try {
                await syncShipment(shipment);
            } catch (error) {
                console.error(
                    `[Shipment Poller] Failed to sync order ${shipment.order?.toString() || shipment._id}:`,
                    error.message
                );
            }
        }
    } catch (error) {
        console.error("[Shipment Poller] Poll cycle failed:", error.message);
    } finally {
        isPolling = false;
    }
};

const startShipmentPoller = () => {
    if (pollerStarted) {
        return;
    }

    pollerStarted = true;

    const initialDelayMs = getInitialDelayMs();
    const pollIntervalMs = getPollIntervalMs();

    initialDelayTimer = setTimeout(async () => {
        await pollOpenShipments();

        pollerTimer = setInterval(async () => {
            await pollOpenShipments();
        }, pollIntervalMs);
    }, initialDelayMs);
};

const stopShipmentPoller = () => {
    if (initialDelayTimer) {
        clearTimeout(initialDelayTimer);
        initialDelayTimer = null;
    }

    if (pollerTimer) {
        clearInterval(pollerTimer);
        pollerTimer = null;
    }

    pollerStarted = false;
    isPolling = false;
};

export {
    startShipmentPoller,
    stopShipmentPoller,
    pollOpenShipments
};
