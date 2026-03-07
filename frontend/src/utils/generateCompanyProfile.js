import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const CB_BLUE = [29, 121, 204];
const CB_BLUE_DRK = [20, 85, 150];
const CB_GREEN = [166, 206, 45];
const CB_DARK = [30, 45, 65];
const CB_GRAY = [100, 116, 139];
const CB_LIGHT_BG = [245, 248, 252];
const CB_ACCENT = [235, 244, 255];
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── Drawing Helpers ──────────────────────────────────────────────────────────

function setFont(doc, size, style = "normal", color = CB_DARK) {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
}

function drawRect(doc, x, y, w, h, color, radius = 0) {
    doc.setFillColor(...color);
    if (radius > 0) {
        doc.roundedRect(x, y, w, h, radius, radius, "F");
    } else {
        doc.rect(x, y, w, h, "F");
    }
}

function drawLine(doc, x1, y1, x2, y2, color, lineWidth = 0.5) {
    doc.setLineWidth(lineWidth);
    doc.setDrawColor(...color);
    doc.line(x1, y1, x2, y2);
}

function addPageHeader(doc, pageNum) {
    drawRect(doc, 0, 0, PAGE_W, 10, CB_BLUE);
    drawRect(doc, 0, 10, PAGE_W, 2, CB_GREEN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text("CLIBERDUCHE CORPORATION  |  COMPANY PROFILE", MARGIN, 6.5);
    if (pageNum > 1) {
        doc.text(`PAGE ${pageNum}`, PAGE_W - MARGIN, 6.5, { align: "right" });
    }
}

function addPageFooter(doc) {
    const y = PAGE_H - 12;
    drawRect(doc, 0, y, PAGE_W, 12, CB_BLUE);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text("(c) 2025 Cliberduche Corporation. All rights reserved.", MARGIN, y + 7);
    doc.text("www.cliberduche.com", PAGE_W - MARGIN, y + 7, { align: "right" });
}

function addSectionTitle(doc, title, yPos) {
    drawRect(doc, MARGIN, yPos, 4, 8, CB_GREEN);
    setFont(doc, 13, "bold", CB_BLUE);
    doc.text(title, MARGIN + 8, yPos + 6.5);
    drawLine(doc, MARGIN, yPos + 10, MARGIN + CONTENT_W, yPos + 10, [210, 220, 235], 0.3);
    return yPos + 18;
}

function addBodyText(doc, text, x, y, maxWidth, lineHeight = 5.5) {
    setFont(doc, 9.5, "normal", [70, 85, 100]);
    const lines = doc.splitTextToSize(text || "", maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
}

function checkNewPage(doc, y, needed, pageCounter) {
    if (y + needed > PAGE_H - 25) {
        doc.addPage();
        pageCounter.count += 1;
        addPageHeader(doc, pageCounter.count);
        addPageFooter(doc);
        return 22;
    }
    return y;
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export async function generateCompanyProfile({ services = [], about = {}, contact = {} }) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageCounter = { count: 1 };

    // ════════════════════════════════════════════════════════════════════════════
    // COVER PAGE
    // ════════════════════════════════════════════════════════════════════════════

    // White background
    drawRect(doc, 0, 0, PAGE_W, PAGE_H, [255, 255, 255]);

    // Full-width blue top section (generous height, no overlapping elements)
    drawRect(doc, 0, 0, PAGE_W, 130, CB_BLUE);

    // Green decorative strip at bottom of blue area
    drawRect(doc, 0, 128, PAGE_W, 5, CB_GREEN);

    // Green circle top-right corner accent (decorative, doesn't overlap text)
    doc.setFillColor(...CB_GREEN);
    doc.circle(PAGE_W - 5, 0, 38, "F");

    // Darker blue circle top-right overlay to refine the shape
    doc.setFillColor(...CB_BLUE_DRK);
    doc.circle(PAGE_W + 8, -8, 32, "F");

    // ── Company name block (placed after the decorative elements) ──────────────
    // Centered, nothing behind it except the solid blue
    setFont(doc, 28, "bold", [255, 255, 255]);
    doc.text("CLIBERDUCHE", PAGE_W / 2, 50, { align: "center" });
    doc.text("CORPORATION", PAGE_W / 2, 64, { align: "center" });

    // Company Profile label pill
    doc.setFillColor(...CB_GREEN);
    doc.roundedRect(PAGE_W / 2 - 52, 72, 104, 9, 2, 2, "F");
    setFont(doc, 8.5, "bold", [255, 255, 255]);
    doc.text("COMPANY PROFILE  |  2025", PAGE_W / 2, 78, { align: "center" });

    // Tagline
    setFont(doc, 10, "italic", [195, 220, 248]);
    doc.text("Building Excellence, Constructing Tomorrow", PAGE_W / 2, 100, { align: "center" });

    // Established badge
    setFont(doc, 8.5, "normal", [190, 215, 242]);
    doc.text("Est. 2018  |  Philippines  |  Construction & Land Development", PAGE_W / 2, 112, { align: "center" });

    // ── Three info highlight boxes (white BG, below the blue band) ───────────
    const boxY = 148;
    const boxH = 32;
    const boxW = (CONTENT_W - 12) / 3;
    const boxItems = [
        { label: "ESTABLISHED", value: "2018" },
        { label: "INDUSTRY", value: "Construction" },
        { label: "LOCATION", value: "Philippines" },
    ];

    boxItems.forEach((box, i) => {
        const bx = MARGIN + i * (boxW + 6);
        drawRect(doc, bx, boxY, boxW, boxH, CB_ACCENT, 4);
        // Green top bar
        drawRect(doc, bx, boxY, boxW, 3, CB_GREEN, 0);
        // Border
        doc.setDrawColor(...CB_BLUE);
        doc.setLineWidth(0.3);
        doc.roundedRect(bx, boxY, boxW, boxH, 4, 4, "S");
        // Label
        setFont(doc, 7, "bold", CB_GRAY);
        doc.text(box.label, bx + boxW / 2, boxY + 11, { align: "center" });
        // Value
        setFont(doc, 12, "bold", CB_BLUE);
        doc.text(box.value, bx + boxW / 2, boxY + 24, { align: "center" });
    });

    // ── Contact strip at bottom of cover ─────────────────────────────────────
    const ctY = PAGE_H - 72;
    drawRect(doc, 0, ctY, PAGE_W, 60, [22, 38, 62]);

    setFont(doc, 9, "bold", CB_GREEN);
    doc.text("CONTACT INFORMATION", MARGIN, ctY + 14);
    drawLine(doc, MARGIN, ctY + 16, MARGIN + 50, ctY + 16, CB_GREEN, 0.7);

    const ctDetails = [
        contact.address ? `Address : ${contact.address}` : null,
        contact.email ? `Email   : ${contact.email}` : null,
        contact.mobile ? `Mobile  : ${contact.mobile}` : null,
        contact.landline ? `Tel     : ${contact.landline}` : null,
    ].filter(Boolean);

    setFont(doc, 8.5, "normal", [175, 200, 230]);
    ctDetails.forEach((detail, i) => {
        doc.text(detail, MARGIN, ctY + 24 + i * 7.5);
    });

    // Green footer bar
    drawRect(doc, 0, PAGE_H - 12, PAGE_W, 12, CB_GREEN);
    setFont(doc, 7, "bold", [255, 255, 255]);
    doc.text("CONFIDENTIAL  -  COMPANY PROFILE  -  CLIBERDUCHE CORPORATION", PAGE_W / 2, PAGE_H - 5, { align: "center" });

    // ════════════════════════════════════════════════════════════════════════════
    // PAGE 2 — ABOUT US
    // ════════════════════════════════════════════════════════════════════════════
    doc.addPage();
    pageCounter.count = 2;
    addPageHeader(doc, pageCounter.count);
    addPageFooter(doc);

    let y = 22;
    y = addSectionTitle(doc, "About Us", y);

    // Intro card
    drawRect(doc, MARGIN, y, CONTENT_W, 11, CB_ACCENT, 3);
    doc.setDrawColor(...CB_BLUE);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, CONTENT_W, 11, 3, 3, "S");
    drawRect(doc, MARGIN, y, 3.5, 11, CB_BLUE, 0);
    setFont(doc, 9, "bold", CB_BLUE);
    doc.text("Established 2018  |  Land Development & Construction Services  |  Philippines", MARGIN + 8, y + 7);
    y += 17;

    // Background section
    if (about.background) {
        setFont(doc, 10.5, "bold", CB_DARK);
        doc.text("Our Background", MARGIN, y + 5);
        y += 10;
        y = addBodyText(doc, about.background, MARGIN, y, CONTENT_W);
        y += 10;
        y = checkNewPage(doc, y, 30, pageCounter);
    }

    // Mission & Vision — two columns
    const halfW = (CONTENT_W - 6) / 2;
    if (about.mission || about.vision) {
        y = checkNewPage(doc, y, 55, pageCounter);
        const cardH = 52;

        if (about.mission) {
            drawRect(doc, MARGIN, y, halfW, cardH, CB_ACCENT, 4);
            drawRect(doc, MARGIN, y, halfW, 1.5, CB_BLUE, 0);
            doc.setDrawColor(...CB_BLUE);
            doc.setLineWidth(0.3);
            doc.roundedRect(MARGIN, y, halfW, cardH, 4, 4, "S");
            setFont(doc, 8, "bold", CB_BLUE);
            doc.text("OUR MISSION", MARGIN + halfW / 2, y + 9, { align: "center" });
            drawLine(doc, MARGIN + 10, y + 11, MARGIN + halfW - 10, y + 11, CB_BLUE, 0.3);
            setFont(doc, 9, "normal", [55, 75, 105]);
            const mLines = doc.splitTextToSize(about.mission, halfW - 10);
            doc.text(mLines, MARGIN + 5, y + 18);
        }

        if (about.vision) {
            const vx = MARGIN + halfW + 6;
            drawRect(doc, vx, y, halfW, cardH, CB_ACCENT, 4);
            drawRect(doc, vx, y, halfW, 1.5, CB_GREEN, 0);
            doc.setDrawColor(...CB_GREEN);
            doc.setLineWidth(0.3);
            doc.roundedRect(vx, y, halfW, cardH, 4, 4, "S");
            setFont(doc, 8, "bold", [90, 130, 30]);
            doc.text("OUR VISION", vx + halfW / 2, y + 9, { align: "center" });
            drawLine(doc, vx + 10, y + 11, vx + halfW - 10, y + 11, CB_GREEN, 0.3);
            setFont(doc, 9, "normal", [55, 75, 105]);
            const vLines = doc.splitTextToSize(about.vision, halfW - 10);
            doc.text(vLines, vx + 5, y + 18);
        }

        y += cardH + 10;
    }

    // Core Values
    y = checkNewPage(doc, y, 55, pageCounter);
    y = addSectionTitle(doc, "Core Values", y);

    const values = [
        { title: "Quality", desc: "High-quality projects aligned with national and local standards.", color: CB_BLUE },
        { title: "Safety", desc: "Strict safety practices before, during, and after project execution.", color: CB_GREEN },
        { title: "Integrity", desc: "Full compliance with laws, reliable schedules, and timely delivery.", color: [80, 120, 200] },
    ];

    const colW = (CONTENT_W - 10) / 3;
    values.forEach((val, idx) => {
        const vx = MARGIN + idx * (colW + 5);
        drawRect(doc, vx, y, colW, 40, CB_LIGHT_BG, 4);
        drawRect(doc, vx, y, colW, 3, val.color, 0);
        doc.setDrawColor(...val.color);
        doc.setLineWidth(0.3);
        doc.roundedRect(vx, y, colW, 40, 4, 4, "S");
        setFont(doc, 9.5, "bold", val.color);
        doc.text(val.title, vx + colW / 2, y + 14, { align: "center" });
        setFont(doc, 8, "normal", CB_GRAY);
        const dLines = doc.splitTextToSize(val.desc, colW - 8);
        doc.text(dLines, vx + 4, y + 23);
    });

    y += 48;

    // ════════════════════════════════════════════════════════════════════════════
    // SERVICES PAGES
    // ════════════════════════════════════════════════════════════════════════════
    if (services.length > 0) {
        const primaryServices = services.filter((s) => s.type === "primary");
        const secondaryServices = services.filter((s) => s.type === "secondary");

        // ── Primary services ────────────────────────────────────────────────────
        if (primaryServices.length > 0) {
            y = checkNewPage(doc, y, 40, pageCounter);
            y = addSectionTitle(doc, "Primary Services", y);

            primaryServices.forEach((service) => {
                y = checkNewPage(doc, y, 45, pageCounter);

                // Title bar
                drawRect(doc, MARGIN, y, CONTENT_W, 8, CB_BLUE, 2);
                setFont(doc, 10, "bold", [255, 255, 255]);
                doc.text(service.title || "Service", MARGIN + 5, y + 5.6);
                y += 10;

                // Description body
                drawRect(doc, MARGIN, y, CONTENT_W, 1, CB_ACCENT);
                setFont(doc, 9, "normal", [70, 85, 105]);
                const desc = service.description || "No description provided.";
                const lines = doc.splitTextToSize(desc, CONTENT_W - 10);
                doc.text(lines, MARGIN + 5, y + 7);
                y += lines.length * 5.5 + 14;
            });
        }

        // ── Secondary services table ─────────────────────────────────────────────
        if (secondaryServices.length > 0) {
            y = checkNewPage(doc, y, 30, pageCounter);
            y = addSectionTitle(doc, "Specialized Solutions", y);

            const tableData = secondaryServices.map((s) => [s.title || "-", s.description || "-"]);

            autoTable(doc, {
                startY: y,
                head: [["Service", "Description"]],
                body: tableData,
                margin: { left: MARGIN, right: MARGIN },
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    textColor: CB_DARK,
                    lineColor: [210, 225, 245],
                    lineWidth: 0.2,
                    overflow: "linebreak",
                },
                headStyles: {
                    fillColor: CB_BLUE,
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                    fontSize: 9.5,
                },
                alternateRowStyles: {
                    fillColor: CB_LIGHT_BG,
                },
                columnStyles: {
                    0: { fontStyle: "bold", cellWidth: 55, textColor: CB_BLUE },
                    1: { cellWidth: "auto" },
                },
                didDrawPage: () => {
                    pageCounter.count += 1;
                    addPageHeader(doc, pageCounter.count);
                    addPageFooter(doc);
                },
            });

            y = (doc.lastAutoTable?.finalY ?? y) + 12;
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // CONTACT PAGE
    // ════════════════════════════════════════════════════════════════════════════
    y = checkNewPage(doc, y, 70, pageCounter);
    y = addSectionTitle(doc, "Contact Information", y);

    const contactItems = [
        contact.address && { icon: "Address", value: contact.address },
        contact.email && { icon: "Email", value: contact.email },
        contact.mobile && { icon: "Mobile", value: contact.mobile },
        contact.landline && { icon: "Telephone", value: contact.landline },
    ].filter(Boolean);

    contactItems.forEach((item) => {
        y = checkNewPage(doc, y, 18, pageCounter);
        drawRect(doc, MARGIN, y, CONTENT_W, 14, CB_LIGHT_BG, 3);
        drawRect(doc, MARGIN, y, 3, 14, CB_BLUE, 0);
        doc.setDrawColor(...[210, 224, 243]);
        doc.setLineWidth(0.3);
        doc.roundedRect(MARGIN, y, CONTENT_W, 14, 3, 3, "S");
        setFont(doc, 7.5, "bold", CB_GRAY);
        doc.text(item.icon.toUpperCase(), MARGIN + 6, y + 5.5);
        setFont(doc, 10, "bold", CB_DARK);
        doc.text(item.value, MARGIN + 6, y + 11);
        y += 18;
    });

    // Thank-you footer card
    y = checkNewPage(doc, y, 35, pageCounter);
    y += 12;
    drawRect(doc, MARGIN, y, CONTENT_W, 30, CB_BLUE, 5);
    setFont(doc, 13, "bold", [255, 255, 255]);
    doc.text("Thank You for Your Interest!", PAGE_W / 2, y + 12, { align: "center" });
    setFont(doc, 9.5, "normal", [195, 220, 248]);
    doc.text("We look forward to partnering with you on your next project.", PAGE_W / 2, y + 23, { align: "center" });

    // ── Save ──────────────────────────────────────────────────────────────────
    doc.save("Cliberduche-Corporation-Company-Profile.pdf");
}
