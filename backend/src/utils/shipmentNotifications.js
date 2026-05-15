import { sendMail } from "./mailer.js";

const NOTIFIABLE_STATUSES = ["Picked Up", "In Transit", "Out for Delivery", "Delivered", "Exception"];

const formatShipmentStatusLabel = (status) => {
    switch (status) {
        case "Picked Up":
            return "picked up";
        case "In Transit":
            return "in transit";
        case "Out for Delivery":
            return "out for delivery";
        case "Delivered":
            return "delivered";
        case "Exception":
            return "delayed";
        default:
            return String(status || "updated").toLowerCase();
    }
};

const buildTrackUrl = (orderId) => {
    const frontendBaseUrl = (process.env.FRONTEND_URL || "http://localhost:4200").replace(/\/$/, "");
    return `${frontendBaseUrl}/track-order/${orderId}`;
};

const buildShipmentEmail = ({ order, shipment, previousStatus, currentStatus }) => {
    const orderId = order?._id?.toString?.() || order?._id || shipment?.order?._id?.toString?.() || "";
    const trackUrl = buildTrackUrl(orderId);
    const customerName = order?.user?.fullName || order?.user?.username || "there";
    const statusLabel = formatShipmentStatusLabel(currentStatus);
    const orderNumber = orderId ? orderId.slice(-8).toUpperCase() : "--------";
    const trackingNumber = shipment?.trackingNumber || "Not assigned yet";
    const courierName = shipment?.courierName || "DHL";

    const subject = `Your order #${orderNumber} is ${statusLabel}`;
    const text = [
        `Hi ${customerName},`,
        "",
        `Your order #${orderNumber} is now ${statusLabel}.`,
        `Courier: ${courierName}`,
        `Tracking Number: ${trackingNumber}`,
        previousStatus ? `Previous Status: ${previousStatus}` : null,
        "",
        `Track your order here: ${trackUrl}`,
        "",
        "Thanks for shopping with us."
    ].filter(Boolean).join("\n");

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#fffaf4;padding:24px">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #eadfce;border-radius:20px;padding:24px">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a16207">Order Update</p>
                <h2 style="margin:0 0 16px;font-size:28px;line-height:1.2">Your order #${orderNumber} is ${statusLabel}</h2>
                <p style="margin:0 0 16px">Hi ${customerName}, your shipment is now ${statusLabel}.</p>
                <div style="background:#fff7ed;border:1px solid #f1e4d4;border-radius:16px;padding:16px;margin:20px 0">
                    <p style="margin:0 0 8px"><strong>Courier:</strong> ${courierName}</p>
                    <p style="margin:0 0 8px"><strong>Tracking Number:</strong> ${trackingNumber}</p>
                    ${previousStatus ? `<p style="margin:0"><strong>Previous Status:</strong> ${previousStatus}</p>` : ""}
                </div>
                <p style="margin:0 0 20px">
                    <a href="${trackUrl}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
                        Track Order
                    </a>
                </p>
                <p style="margin:0;color:#475569">If the button does not work, copy and paste this link into your browser:</p>
                <p style="word-break:break-all;margin:8px 0 0;color:#0f172a">${trackUrl}</p>
            </div>
        </div>
    `;

    return { subject, text, html };
};

const buildShipmentCreatedEmail = ({ order, shipment }) => {
    const orderId = order?._id?.toString?.() || order?._id || shipment?.order?._id?.toString?.() || "";
    const trackUrl = buildTrackUrl(orderId);
    const customerName = order?.user?.fullName || order?.user?.username || "there";
    const orderNumber = orderId ? orderId.slice(-8).toUpperCase() : "--------";
    const trackingNumber = shipment?.trackingNumber || "Not assigned yet";
    const courierName = shipment?.courierName || "DHL";

    const subject = `Your shipment for order #${orderNumber} has been created`;
    const text = [
        `Hi ${customerName},`,
        "",
        `Your shipment for order #${orderNumber} has been created.`,
        `Courier: ${courierName}`,
        `Tracking Number: ${trackingNumber}`,
        "",
        `Track your order here: ${trackUrl}`,
        "",
        "Thanks for shopping with us."
    ].join("\n");

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#fffaf4;padding:24px">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #eadfce;border-radius:20px;padding:24px">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a16207">Shipment Created</p>
                <h2 style="margin:0 0 16px;font-size:28px;line-height:1.2">Your shipment for order #${orderNumber} is ready</h2>
                <p style="margin:0 0 16px">Hi ${customerName}, we’ve created your shipment and tracking details are now available.</p>
                <div style="background:#fff7ed;border:1px solid #f1e4d4;border-radius:16px;padding:16px;margin:20px 0">
                    <p style="margin:0 0 8px"><strong>Courier:</strong> ${courierName}</p>
                    <p style="margin:0 0 8px"><strong>Tracking Number:</strong> ${trackingNumber}</p>
                </div>
                <p style="margin:0 0 20px">
                    <a href="${trackUrl}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
                        Track Order
                    </a>
                </p>
                <p style="margin:0;color:#475569">If the button does not work, copy and paste this link into your browser:</p>
                <p style="word-break:break-all;margin:8px 0 0;color:#0f172a">${trackUrl}</p>
            </div>
        </div>
    `;

    return { subject, text, html };
};

const shouldNotifyShipmentStatus = (status) => NOTIFIABLE_STATUSES.includes(status);

const sendShipmentStatusEmail = async ({ order, shipment, previousStatus, currentStatus }) => {
    if (!order?.user?.email || !currentStatus || !shouldNotifyShipmentStatus(currentStatus)) {
        return false;
    }

    const payload = buildShipmentEmail({
        order,
        shipment,
        previousStatus,
        currentStatus
    });

    await sendMail({
        to: order.user.email,
        subject: payload.subject,
        text: payload.text,
        html: payload.html
    });

    return true;
};

const sendShipmentCreatedEmail = async ({ order, shipment }) => {
    if (!order?.user?.email) {
        return false;
    }

    const payload = buildShipmentCreatedEmail({
        order,
        shipment
    });

    await sendMail({
        to: order.user.email,
        subject: payload.subject,
        text: payload.text,
        html: payload.html
    });

    return true;
};

export {
    sendShipmentStatusEmail,
    shouldNotifyShipmentStatus,
    sendShipmentCreatedEmail
};
