import { sendMail } from "./mailer.js";

const STATUS_LABELS = {
    new: "New",
    reviewed: "Reviewed",
    contacted: "Contacted",
    closed: "Closed"
};

const SUPPORT_NOTE = "If you need help, reply to this email and our team will get back to you shortly.";

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const getStatusLabel = (status) => STATUS_LABELS[String(status || "").trim()] || "Updated";

const buildBulkInquiryStatusEmail = ({ inquiry, status, message, responderName }) => {
    const customerName = String(inquiry?.fullName || "there").trim();
    const businessName = String(inquiry?.businessName || "").trim();
    const orderType = String(inquiry?.orderType || "bulk inquiry").trim();
    const statusLabel = getStatusLabel(status);
    const vendorMessage = String(message || inquiry?.vendorResponseMessage || "").trim();
    const responderLabel = String(responderName || "our team").trim();

    const subject = "Update on your Bulk Order Inquiry";

    const text = [
        `Hi ${customerName},`,
        "",
        `Your bulk order inquiry has been updated to: ${statusLabel}.`,
        businessName ? `Business Name: ${businessName}` : null,
        `Inquiry Type: ${orderType}`,
        vendorMessage ? `Message from ${responderLabel}: ${vendorMessage}` : null,
        "",
        SUPPORT_NOTE,
        "",
        "Thank you for reaching out to us."
    ].filter(Boolean).join("\n");

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;background:#fffaf4;padding:24px">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #eadfce;border-radius:20px;padding:24px">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a16207">Bulk Inquiry Update</p>
                <h2 style="margin:0 0 16px;font-size:28px;line-height:1.2">Your bulk order inquiry is now ${escapeHtml(statusLabel)}</h2>
                <p style="margin:0 0 16px">Hi ${escapeHtml(customerName)}, we wanted to share an update on your bulk inquiry.</p>
                <div style="background:#fff7ed;border:1px solid #f1e4d4;border-radius:16px;padding:16px;margin:20px 0">
                    ${businessName ? `<p style="margin:0 0 8px"><strong>Business Name:</strong> ${escapeHtml(businessName)}</p>` : ""}
                    <p style="margin:0 0 8px"><strong>Inquiry Type:</strong> ${escapeHtml(orderType)}</p>
                    <p style="margin:0"><strong>Status:</strong> ${escapeHtml(statusLabel)}</p>
                </div>
                ${
                    vendorMessage
                        ? `
                            <div style="background:#fffaf4;border:1px solid #eadfce;border-radius:16px;padding:16px;margin:20px 0">
                                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a16207">Message from ${escapeHtml(responderLabel)}</p>
                                <p style="margin:0;white-space:pre-line">${escapeHtml(vendorMessage)}</p>
                            </div>
                        `
                        : ""
                }
                <p style="margin:0;color:#475569">${escapeHtml(SUPPORT_NOTE)}</p>
            </div>
        </div>
    `;

    return {
        subject,
        text,
        html
    };
};

const sendBulkInquiryStatusEmail = async ({ inquiry, status, message, responderName }) => {
    if (!inquiry?.email) {
        return false;
    }

    const payload = buildBulkInquiryStatusEmail({
        inquiry,
        status,
        message,
        responderName
    });

    await sendMail({
        to: inquiry.email,
        subject: payload.subject,
        text: payload.text,
        html: payload.html
    });

    return true;
};

export {
    sendBulkInquiryStatusEmail
};
