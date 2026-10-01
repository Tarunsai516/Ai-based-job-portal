package com.jobportal.backend.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.jobportal.backend.service.ai.TailoredResumeResult;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@Service
public class PdfGenerationService {

    private static final DeviceRgb COLOR_PRIMARY = new DeviceRgb(27, 42, 74);   // Navy
    private static final DeviceRgb COLOR_ACCENT = new DeviceRgb(90, 105, 120);  // Slate Gray
    private static final DeviceRgb COLOR_BODY = new DeviceRgb(30, 35, 45);     // Dark Slate
    private static final DeviceRgb COLOR_DIVIDER = new DeviceRgb(210, 215, 225);

    /**
     * Generates an executive-grade, ATS-optimized PDF resume from structured data.
     */
    public void generatePdf(TailoredResumeResult data, Path targetPath) throws IOException {
        File file = targetPath.toFile();
        if (file.getParentFile() != null && !file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }

        PdfFont fontRegular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont fontOblique = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

        try (PdfWriter writer = new PdfWriter(file);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            document.setMargins(32, 36, 32, 36);

            // --- Candidate Name ---
            if (data.getName() != null && !data.getName().isBlank()) {
                Paragraph namePara = new Paragraph(data.getName().toUpperCase())
                        .setFont(fontBold)
                        .setFontSize(19)
                        .setFontColor(COLOR_PRIMARY)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginBottom(3);
                document.add(namePara);
            }

            // --- Contact Information ---
            String contactInfo = buildContactLine(data.getEmail(), data.getPhone(), data.getLocation());
            if (!contactInfo.isBlank()) {
                Paragraph contactPara = new Paragraph(contactInfo)
                        .setFont(fontRegular)
                        .setFontSize(9.5f)
                        .setFontColor(COLOR_ACCENT)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginBottom(12);
                document.add(contactPara);
            }

            // --- Professional Summary ---
            if (data.getSummary() != null && !data.getSummary().isBlank()) {
                addSectionHeader(document, "PROFESSIONAL SUMMARY", fontBold);
                Paragraph summaryPara = new Paragraph(data.getSummary())
                        .setFont(fontRegular)
                        .setFontSize(9.5f)
                        .setFontColor(COLOR_BODY)
                        .setMultipliedLeading(1.25f)
                        .setMarginBottom(10);
                document.add(summaryPara);
            }

            // --- Technical & Professional Skills ---
            if (data.getSkills() != null && !data.getSkills().isEmpty()) {
                addSectionHeader(document, "CORE COMPETENCIES & SKILLS", fontBold);
                Paragraph skillsPara = new Paragraph(String.join("   •   ", data.getSkills()))
                        .setFont(fontRegular)
                        .setFontSize(9.5f)
                        .setFontColor(COLOR_BODY)
                        .setMultipliedLeading(1.25f)
                        .setMarginBottom(10);
                document.add(skillsPara);
            }

            // --- Experience ---
            if (data.getExperience() != null && !data.getExperience().isEmpty()) {
                addSectionHeader(document, "PROFESSIONAL EXPERIENCE", fontBold);

                for (TailoredResumeResult.ExperienceEntry exp : data.getExperience()) {
                    Paragraph header = new Paragraph();
                    header.setMarginBottom(2);
                    header.setMarginTop(4);

                    Text titleText = new Text(safe(exp.getTitle()))
                            .setFont(fontBold)
                            .setFontSize(10.5f)
                            .setFontColor(COLOR_PRIMARY);
                    header.add(titleText);

                    if (exp.getCompany() != null && !exp.getCompany().isBlank()) {
                        header.add(new Text("  |  " + exp.getCompany())
                                .setFont(fontBold)
                                .setFontSize(10f)
                                .setFontColor(COLOR_BODY));
                    }

                    if (exp.getDuration() != null && !exp.getDuration().isBlank()) {
                        header.add(new Text("   (" + exp.getDuration() + ")")
                                .setFont(fontOblique)
                                .setFontSize(9f)
                                .setFontColor(COLOR_ACCENT));
                    }
                    document.add(header);

                    if (exp.getBullets() != null) {
                        for (String bullet : exp.getBullets()) {
                            if (bullet != null && !bullet.isBlank()) {
                                Paragraph bulletPara = new Paragraph("•  " + bullet.trim())
                                        .setFont(fontRegular)
                                        .setFontSize(9.5f)
                                        .setFontColor(COLOR_BODY)
                                        .setMultipliedLeading(1.2f)
                                        .setMarginLeft(12)
                                        .setMarginBottom(2);
                                document.add(bulletPara);
                            }
                        }
                    }
                }
                document.add(new Paragraph().setMarginBottom(6));
            }

            // --- Projects ---
            if (data.getProjects() != null && !data.getProjects().isEmpty()) {
                addSectionHeader(document, "PROJECTS & KEY ACHIEVEMENTS", fontBold);

                for (TailoredResumeResult.ProjectEntry proj : data.getProjects()) {
                    Paragraph projHeader = new Paragraph();
                    projHeader.setMarginBottom(2);
                    projHeader.setMarginTop(3);

                    projHeader.add(new Text(safe(proj.getName()))
                            .setFont(fontBold)
                            .setFontSize(10f)
                            .setFontColor(COLOR_PRIMARY));

                    if (proj.getTechnologies() != null && !proj.getTechnologies().isEmpty()) {
                        projHeader.add(new Text("  [" + String.join(", ", proj.getTechnologies()) + "]")
                                .setFont(fontOblique)
                                .setFontSize(8.5f)
                                .setFontColor(COLOR_ACCENT));
                    }
                    document.add(projHeader);

                    if (proj.getDescription() != null && !proj.getDescription().isBlank()) {
                        Paragraph projDesc = new Paragraph("•  " + proj.getDescription().trim())
                                .setFont(fontRegular)
                                .setFontSize(9.5f)
                                .setFontColor(COLOR_BODY)
                                .setMultipliedLeading(1.2f)
                                .setMarginLeft(12)
                                .setMarginBottom(3);
                        document.add(projDesc);
                    }
                }
                document.add(new Paragraph().setMarginBottom(6));
            }

            // --- Education ---
            if (data.getEducation() != null && !data.getEducation().isEmpty()) {
                addSectionHeader(document, "EDUCATION", fontBold);

                for (TailoredResumeResult.EducationEntry edu : data.getEducation()) {
                    Paragraph eduPara = new Paragraph();
                    eduPara.setMarginBottom(3);
                    eduPara.setMarginTop(2);

                    eduPara.add(new Text(safe(edu.getDegree()))
                            .setFont(fontBold)
                            .setFontSize(10f)
                            .setFontColor(COLOR_PRIMARY));

                    if (edu.getInstitution() != null && !edu.getInstitution().isBlank()) {
                        eduPara.add(new Text("  —  " + edu.getInstitution())
                                .setFont(fontRegular)
                                .setFontSize(9.5f)
                                .setFontColor(COLOR_BODY));
                    }

                    if (edu.getYear() != null && !edu.getYear().isBlank()) {
                        eduPara.add(new Text("   (" + edu.getYear() + ")")
                                .setFont(fontOblique)
                                .setFontSize(9f)
                                .setFontColor(COLOR_ACCENT));
                    }
                    document.add(eduPara);
                }
                document.add(new Paragraph().setMarginBottom(6));
            }

            // --- Certifications ---
            if (data.getCertifications() != null && !data.getCertifications().isEmpty()) {
                addSectionHeader(document, "CERTIFICATIONS", fontBold);
                for (String cert : data.getCertifications()) {
                    if (cert != null && !cert.isBlank()) {
                        Paragraph certPara = new Paragraph("•  " + cert.trim())
                                .setFont(fontRegular)
                                .setFontSize(9.5f)
                                .setFontColor(COLOR_BODY)
                                .setMarginLeft(12)
                                .setMarginBottom(2);
                        document.add(certPara);
                    }
                }
            }
        }
    }

    /**
     * Fallback method for plain text PDF creation.
     */
    public void generatePdfFromText(String text, Path targetPath) throws IOException {
        File file = targetPath.toFile();
        if (file.getParentFile() != null && !file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }

        try (PdfWriter writer = new PdfWriter(file);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            String[] lines = text.split("\n");
            for (String line : lines) {
                if (line.trim().isEmpty()) {
                    document.add(new Paragraph("\n"));
                } else {
                    document.add(new Paragraph(line.trim()));
                }
            }
        }
    }

    private void addSectionHeader(Document document, String title, PdfFont fontBold) {
        Paragraph p = new Paragraph(title)
                .setFont(fontBold)
                .setFontSize(11)
                .setFontColor(COLOR_PRIMARY)
                .setMarginTop(8)
                .setMarginBottom(2);
        document.add(p);

        SolidLine line = new SolidLine(0.75f);
        line.setColor(COLOR_DIVIDER);
        LineSeparator separator = new LineSeparator(line);
        separator.setMarginBottom(6);
        document.add(separator);
    }

    private String buildContactLine(String email, String phone, String location) {
        StringBuilder sb = new StringBuilder();
        if (email != null && !email.isBlank()) sb.append(email.trim());
        if (phone != null && !phone.isBlank()) {
            if (sb.length() > 0) sb.append("   |   ");
            sb.append(phone.trim());
        }
        if (location != null && !location.isBlank()) {
            if (sb.length() > 0) sb.append("   |   ");
            sb.append(location.trim());
        }
        return sb.toString();
    }

    private String safe(String val) {
        return val == null ? "" : val.trim();
    }
}
