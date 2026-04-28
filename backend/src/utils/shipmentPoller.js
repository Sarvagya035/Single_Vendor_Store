import { Shipment } from "../models/shipment.model.js";
import { syncShipmentFromDhl, syncTestShipment } from "../services/dhl.service.js";
import { sendShipmentStatusEmail } from "./shipmentNotifications.js";
import { syncOrderFromShipment } from "./shipmentOrderSync.js";

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

const isVersionConflictError = (error) =>
    error?.name === "VersionError" ||
    /No matching document found/i.test(error?.message || "");

const reloadShipmentById = async (shipmentId) => {
    if (!shipmentId) {
        return null;
    }

    return Shipment.findById(shipmentId).populate({
        path: "order",
        populate: {
            path: "user",
            select: "fullName username email"
        }
    });
};

const syncShipmentSafely = async (shipment) => {
    const shipmentId = shipment?._id?.toString?.() || shipment?._id;
    const previousStatus = shipment.shipmentStatus;

    try {
        const updatedShipment = await syncShipment(shipment);
        if (!updatedShipment) {
            return null;
        }

        await syncOrderFromShipment(updatedShipment.order, updatedShipment);
        return { shipment: updatedShipment, previousStatus };
    } catch (error) {
        if (!isVersionConflictError(error)) {
            throw error;
        }

        const freshShipment = await reloadShipmentById(shipmentId);
        if (!freshShipment) {
            return null;
        }

        const freshPreviousStatus = freshShipment.shipmentStatus;
        const updatedShipment = await syncShipment(freshShipment);
        if (!updatedShipment) {
            return null;
        }

        await syncOrderFromShipment(updatedShipment.order, updatedShipment);
        return { shipment: updatedShipment, previousStatus: freshPreviousStatus };
    }
};

const pollOpenShipments = async () => {
    if (isPolling) {
        return;
    }

    isPolling = true;

    try {
        const shipments = await Shipment.find({
            shipmentStatus: { $nin: FINAL_STATUSES }
        }).populate({
            path: "order",
            populate: {
                path: "user",
                select: "fullName username email"
            }
        });

        if (!shipments.length) {
            return;
        }

        for (const shipment of shipments) {
            try {
                const synced = await syncShipmentSafely(shipment);
                if (!synced?.shipment) {
                    continue;
                }

                const { shipment: updatedShipment, previousStatus } = synced;

                if (updatedShipment.shipmentStatus !== previousStatus) {
                    try {
                        await sendShipmentStatusEmail({
                            order: updatedShipment.order,
                            shipment: updatedShipment,
                            previousStatus,
                            currentStatus: updatedShipment.shipmentStatus
                        });
                    } catch (emailError) {
                        console.error(
                            `[Shipment Poller] Email send failed for order ${updatedShipment.order?._id?.toString?.() || updatedShipment.order?.toString?.() || updatedShipment._id}:`,
                            emailError.message
                        );
                    }
                }
            } catch (error) {
                console.error(
                    `[Shipment Poller] Failed to sync order ${shipment.order?._id?.toString?.() || shipment.order?.toString?.() || shipment._id}:`,
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
