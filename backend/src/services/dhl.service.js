import { Shipment } from "../models/shipment.model.js";

const DHL_TRACKING_URL = "https://api-eu.dhl.com/track/shipments";

const shipmentTimeline = ["Created", "Picked Up", "In Transit", "Out for Delivery", "Delivered"];

const generateMockTrackingNumber = (orderId) => {
    const suffix = `${Date.now()}`.slice(-8);
    const orderSuffix = orderId.toString().slice(-6).toUpperCase();
    return `TEST-DHL-${orderSuffix}-${suffix}`;
};

const buildMockEvents = (status, trackingNumber) => {
    return [
        {
            status: "Shipment Created",
            description: `Test shipment created for ${trackingNumber}`,
            eventTime: new Date()
        },
        {
            status,
            description: `Current test status set to ${status}`,
            eventTime: new Date()
        }
    ];
};

const advanceMockShipmentStatus = (currentStatus = "Created") => {
    const currentIndex = shipmentTimeline.indexOf(currentStatus);
    const nextIndex = Math.min(currentIndex + 1, shipmentTimeline.length - 1);
    return shipmentTimeline[nextIndex] || "Created";
};

const normalizeDhlTrackingResponse = (payload) => {
    const shipment = payload?.shipments?.[0] || payload?.shipment || payload;
    const rawStatus =
        shipment?.status?.status ||
        shipment?.status ||
        shipment?.shipmentStatus ||
        shipment?.details?.status ||
        "In Transit";

    const events = Array.isArray(shipment?.events)
        ? shipment.events.map((event) => ({
              status: event?.status || event?.description || "Update",
              description: event?.description || event?.status || "",
              location: event?.location,
              eventTime: event?.timestamp || event?.eventTime || event?.date
          }))
        : [];

    return {
        shipmentStatus: rawStatus,
        estimatedDeliveryDate:
            shipment?.estimatedDeliveryDate ||
            shipment?.estimatedDeliveryTime ||
            shipment?.estimatedTimeOfDelivery ||
            null,
        events,
        rawResponse: payload
    };
};

const createShipmentForOrder = async (order) => {
    const existingShipment = await Shipment.findOne({ order: order._id });
    if (existingShipment) {
        return existingShipment;
    }

    const isTestMode = process.env.DELIVERY_MODE !== "production";
    const trackingNumber = isTestMode ? generateMockTrackingNumber(order._id) : "";

    const shipment = await Shipment.create({
        order: order._id,
        courierName: "DHL",
        trackingNumber,
        shipmentStatus: "Created",
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        isTestMode,
        trackingEvents: buildMockEvents("Created", trackingNumber)
    });

    return shipment;
};

const syncShipmentFromDhl = async (shipment) => {
    if (!shipment.trackingNumber) {
        return shipment;
    }

    const apiKey = process.env.DHL_API_KEY;
    if (!apiKey) {
        throw new Error("DHL_API_KEY is missing");
    }

    const url = new URL(DHL_TRACKING_URL);
    url.searchParams.set("trackingNumber", shipment.trackingNumber);

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "DHL-API-Key": apiKey,
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DHL tracking request failed: ${response.status} ${errorText}`);
    }

    const payload = await response.json();
    const normalized = normalizeDhlTrackingResponse(payload);

    shipment.shipmentStatus = normalized.shipmentStatus;
    shipment.estimatedDeliveryDate = normalized.estimatedDeliveryDate || shipment.estimatedDeliveryDate;
    shipment.trackingEvents = normalized.events.length ? normalized.events : shipment.trackingEvents;
    shipment.rawResponse = normalized.rawResponse;
    shipment.lastSyncedAt = new Date();

    if (shipment.shipmentStatus === "Delivered" && !shipment.deliveredAt) {
        shipment.deliveredAt = new Date();
    }

    await shipment.save();
    return shipment;
};

const syncTestShipment = async (shipment) => {
    const nextStatus = advanceMockShipmentStatus(shipment.shipmentStatus);
    shipment.shipmentStatus = nextStatus;
    shipment.lastSyncedAt = new Date();
    shipment.trackingEvents = [
        ...(shipment.trackingEvents || []),
        {
            status: nextStatus,
            description: `Test shipment advanced to ${nextStatus}`,
            eventTime: new Date()
        }
    ];

    if (nextStatus === "Delivered" && !shipment.deliveredAt) {
        shipment.deliveredAt = new Date();
    }

    await shipment.save();
    return shipment;
};

export {
    createShipmentForOrder,
    syncShipmentFromDhl,
    syncTestShipment
};
