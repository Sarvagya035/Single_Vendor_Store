const A4_LANDSCAPE_WIDTH = 842;
const A4_LANDSCAPE_HEIGHT = 595;
const PDF_LEFT_MARGIN = 28;
const PDF_TOP_START = 552;
const PDF_BOTTOM_MARGIN = 36;
const PDF_FONT_SIZE = 8;
const PDF_LINE_HEIGHT = 11;

const escapeCsvValue = (value) => {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
};

const escapePdfValue = (value) => String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");

const truncatePdfValue = (value, maxLength = 120) => {
    const text = String(value ?? "").replace(/\r?\n/g, " ");

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
};

const padRight = (value, width) => {
    const text = String(value ?? "");

    if (text.length >= width) {
        return text.slice(0, width);
    }

    return text.padEnd(width, " ");
};

const fitText = (value, width) => {
    const text = String(value ?? "").replace(/\r?\n/g, " ");

    if (text.length <= width) {
        return text;
    }

    if (width <= 3) {
        return text.slice(0, width);
    }

    return `${text.slice(0, width - 3)}...`;
};

const formatDateForReport = (value) => {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const formatDateOnly = (value) => {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-CA");
};

const formatDisplayOrderId = (value) => {
    const text = String(value ?? "");

    if (!text) {
        return "-";
    }

    if (text.length <= 12) {
        return text;
    }

    return `...${text.slice(-8)}`;
};

const buildCsvReport = ({ title, summaryRows = [], headers = [], rows = [] }) => {
    const lines = [
        `Report Title,${escapeCsvValue(title)}`,
        `Generated At,${escapeCsvValue(new Date().toLocaleString("en-IN"))}`
    ];

    summaryRows.forEach(([label, value]) => {
        lines.push(`${escapeCsvValue(label)},${escapeCsvValue(value)}`);
    });

    lines.push("");
    lines.push(headers.map(escapeCsvValue).join(","));
    rows.forEach((row) => {
        lines.push(row.map(escapeCsvValue).join(","));
    });

    return `\uFEFF${lines.join("\r\n")}`;
};

const buildPdfStream = ({ title, subtitle, summaryRows = [], headers = [], rows = [] }) => {
    const reportPages = paginateReportRows(rows);
    const objects = [];
    const pageObjectNumbers = [];
    const generatedAt = new Date().toLocaleString("en-IN");

    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("<< /Type /Pages /Kids [] /Count 0 >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>");

    reportPages.forEach((page, pageIndex) => {
        const pageObjectNumber = 7 + (pageIndex * 2);
        const contentObjectNumber = pageObjectNumber + 1;
        pageObjectNumbers.push(pageObjectNumber);

        const content = buildPageContent({
            title,
            subtitle,
            summaryRows,
            headers,
            rows: page.rows,
            pageNumber: pageIndex + 1,
            totalPages: reportPages.length,
            generatedAt,
            isFirstPage: pageIndex === 0
        });

        objects.push(
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_LANDSCAPE_WIDTH} ${A4_LANDSCAPE_HEIGHT}] ` +
            `/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
        );
        objects.push(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
    });

    objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${reportPages.length} >>`;

    const header = "%PDF-1.4\n%\xFF\xFF\xFF\xFF\n";
    const parts = [header];
    const offsets = [0];
    let currentOffset = Buffer.byteLength(header, "utf8");

    objects.forEach((objectContent, index) => {
        const objectHeader = `${index + 1} 0 obj\n`;
        const objectBody = `${objectContent}\nendobj\n`;
        const objectText = `${objectHeader}${objectBody}`;
        offsets.push(currentOffset);
        parts.push(objectText);
        currentOffset += Buffer.byteLength(objectText, "utf8");
    });

    const xrefStart = currentOffset;
    const xrefLines = [
        "xref",
        `0 ${objects.length + 1}`,
        "0000000000 65535 f "
    ];

    for (let index = 1; index < offsets.length; index += 1) {
        xrefLines.push(`${String(offsets[index]).padStart(10, "0")} 00000 n `);
    }

    const trailer = [
        "trailer",
        `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
        "startxref",
        `${xrefStart}`,
        "%%EOF"
    ].join("\n");

    return Buffer.from(`${parts.join("")}${xrefLines.join("\n")}\n${trailer}`, "utf8");
};

const paginateReportRows = (rows = []) => {
    if (!rows.length) {
        return [{ rows: [] }];
    }

    const pages = [{ rows: rows.slice(0, 13) }];
    let cursor = 13;

    while (cursor < rows.length) {
        pages.push({ rows: rows.slice(cursor, cursor + 24) });
        cursor += 24;
    }

    return pages;
};

const buildPageContent = ({
    title,
    subtitle,
    summaryRows = [],
    headers = [],
    rows = [],
    pageNumber,
    totalPages,
    generatedAt,
    isFirstPage
}) => {
    const commands = [];
    const left = PDF_LEFT_MARGIN;
    const width = A4_LANDSCAPE_WIDTH - (PDF_LEFT_MARGIN * 2);
    const headerTop = 520;
    const headerHeight = 44;
    const tableColumns = getReportTableColumns();
    const tableHeaderY = isFirstPage ? 276 : 476;
    const rowHeight = 18;
    const rowStartY = tableHeaderY - rowHeight;

    commands.push("q");
    commands.push("0.96 0.98 1 rg");
    commands.push(`${left} ${headerTop} ${width} ${headerHeight} re f`);
    commands.push("0.11 0.15 0.27 rg");
    commands.push(`${left} ${headerTop} 6 ${headerHeight} re f`);
    commands.push("Q");

    drawText(commands, {
        text: title,
        x: left + 14,
        y: 548,
        font: "F2",
        size: 18,
        color: [0.09, 0.12, 0.2]
    });

    drawText(commands, {
        text: subtitle,
        x: left + 14,
        y: 530,
        font: "F1",
        size: 9,
        color: [0.35, 0.43, 0.58]
    });

    drawRoundedCard(commands, {
        x: 640,
        y: 541,
        width: 164,
        height: 22,
        fill: [0.91, 0.95, 1],
        stroke: [0.68, 0.78, 0.98]
    });

    drawText(commands, {
        text: `Range: ${subtitle.replace(/^Range:\s*/i, "")}`,
        x: 652,
        y: 548,
        font: "F2",
        size: 8,
        color: [0.1, 0.2, 0.45]
    });

    if (isFirstPage) {
        drawText(commands, {
            text: "Summary",
            x: left + 2,
            y: 502,
            font: "F2",
            size: 10,
            color: [0.09, 0.12, 0.2]
        });

        drawText(commands, {
            text: `Generated: ${generatedAt}`,
            x: left + 100,
            y: 502,
            font: "F1",
            size: 8,
            color: [0.42, 0.46, 0.56]
        });

        renderSummaryCards(commands, summaryRows);
    }

    drawTableHeader(commands, headers, tableColumns, tableHeaderY);
    renderTableRows(commands, rows, tableColumns, rowStartY, rowHeight);

    drawText(commands, {
        text: `Generated ${generatedAt}`,
        x: left,
        y: 18,
        font: "F1",
        size: 7,
        color: [0.5, 0.54, 0.6]
    });

    drawText(commands, {
        text: `Page ${pageNumber} of ${totalPages}`,
        x: 748,
        y: 18,
        font: "F1",
        size: 7,
        color: [0.5, 0.54, 0.6]
    });

    commands.push("Q");
    return commands.join("\n");
};

const renderSummaryCards = (commands, summaryRows = []) => {
    const cardWidth = 381;
    const cardHeight = 34;
    const gapX = 24;
    const gapY = 8;
    const startX = PDF_LEFT_MARGIN;
    let startY = 470;

    const palette = [
        { fill: [0.95, 0.98, 1], stroke: [0.79, 0.88, 0.98] },
        { fill: [0.95, 1, 0.97], stroke: [0.77, 0.9, 0.83] },
        { fill: [1, 0.99, 0.95], stroke: [0.95, 0.86, 0.69] },
        { fill: [0.99, 0.96, 0.97], stroke: [0.94, 0.79, 0.82] }
    ];

    for (let index = 0; index < summaryRows.length; index += 2) {
        const left = summaryRows[index];
        const right = summaryRows[index + 1];

        if (left) {
            const tone = palette[(index / 2) % palette.length];
            drawSummaryCard(commands, {
                label: left[0],
                value: left[1],
                x: startX,
                y: startY,
                width: cardWidth,
                height: cardHeight,
                fill: tone.fill,
                stroke: tone.stroke
            });
        }

        if (right) {
            const tone = palette[((index / 2) + 1) % palette.length];
            drawSummaryCard(commands, {
                label: right[0],
                value: right[1],
                x: startX + cardWidth + gapX,
                y: startY,
                width: cardWidth,
                height: cardHeight,
                fill: tone.fill,
                stroke: tone.stroke
            });
        }

        startY -= cardHeight + gapY;
    }
};

const drawSummaryCard = (commands, { label, value, x, y, width, height, fill, stroke }) => {
    drawRoundedCard(commands, { x, y, width, height, fill, stroke });

    drawText(commands, {
        text: fitText(label, 26).toUpperCase(),
        x: x + 12,
        y: y + 23,
        font: "F1",
        size: 6.5,
        color: [0.4, 0.45, 0.52]
    });

    drawText(commands, {
        text: fitText(value, 40),
        x: x + 12,
        y: y + 10,
        font: "F2",
        size: 11,
        color: [0.1, 0.14, 0.22]
    });
};

const drawTableHeader = (commands, headers, tableColumns, yTop) => {
    const left = PDF_LEFT_MARGIN;
    const width = A4_LANDSCAPE_WIDTH - (PDF_LEFT_MARGIN * 2);
    const height = 22;

    commands.push("q");
    commands.push("0.09 0.12 0.22 rg");
    commands.push(`${left} ${yTop} ${width} ${height} re f`);
    commands.push("Q");

    let currentX = left;
    tableColumns.forEach((column, index) => {
        const label = headers[index] || column.label;
        drawText(commands, {
            text: fitText(label, column.width - 6),
            x: currentX + 4,
            y: yTop + 7,
            font: "F4",
            size: 7.2,
            color: [1, 1, 1]
        });
        currentX += column.width;
    });
};

const renderTableRows = (commands, rows, tableColumns, startRowY, rowHeight) => {
    let currentY = startRowY;

    rows.forEach((row, rowIndex) => {
        const fill = rowIndex % 2 === 0 ? [0.98, 0.99, 1] : [1, 1, 1];
        const stroke = [0.9, 0.92, 0.96];
        drawRoundedRow(commands, {
            x: PDF_LEFT_MARGIN,
            y: currentY,
            width: A4_LANDSCAPE_WIDTH - (PDF_LEFT_MARGIN * 2),
            height: rowHeight - 1,
            fill,
            stroke
        });

        let currentX = PDF_LEFT_MARGIN;
        row.forEach((cell, cellIndex) => {
            const column = tableColumns[cellIndex];
            if (!column) return;

            drawText(commands, {
                text: fitText(truncatePdfValue(cell), column.width - 8),
                x: currentX + 4,
                y: currentY + 5,
                font: "F3",
                size: 7.2,
                color: [0.12, 0.15, 0.22]
            });

            currentX += column.width;
        });

        currentY -= rowHeight;
    });
};

const drawText = (commands, { text, x, y, font = "F1", size = 9, color = [0, 0, 0] }) => {
    const [r, g, b] = color;
    commands.push("BT");
    commands.push(`/${font} ${size} Tf`);
    commands.push(`${r} ${g} ${b} rg`);
    commands.push(`1 0 0 1 ${x} ${y} Tm`);
    commands.push(`(${escapePdfValue(text)}) Tj`);
    commands.push("ET");
};

const drawRoundedCard = (commands, { x, y, width, height, fill, stroke }) => {
    const [fr, fg, fb] = fill;
    const [sr, sg, sb] = stroke;
    commands.push("q");
    commands.push(`${fr} ${fg} ${fb} rg`);
    commands.push(`${x} ${y - height} ${width} ${height} re f`);
    commands.push(`${sr} ${sg} ${sb} RG`);
    commands.push("0.8 w");
    commands.push(`${x} ${y - height} ${width} ${height} re S`);
    commands.push("Q");
};

const drawRoundedRow = drawRoundedCard;

const getReportTableColumns = () => [
    { label: "Order ID", width: 84 },
    { label: "Order Date", width: 92 },
    { label: "Customer", width: 96 },
    { label: "Customer Email", width: 144 },
    { label: "Order Status", width: 68 },
    { label: "Item Name", width: 150 },
    { label: "Qty", width: 34 },
    { label: "Unit Price", width: 54 },
    { label: "Line Total", width: 64 }
];

export {
    buildCsvReport,
    buildPdfStream,
    formatDisplayOrderId,
    formatDateForReport,
    formatDateOnly
};
