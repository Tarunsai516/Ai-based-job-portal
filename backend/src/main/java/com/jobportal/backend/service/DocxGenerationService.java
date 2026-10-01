package com.jobportal.backend.service;

import com.jobportal.backend.service.ai.TailoredResumeResult;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.Path;
import java.util.List;

/**
 * Generates professional DOCX resumes from structured TailoredResumeResult data
 * using Apache POI. Produces clean, ATS-friendly formatting with proper headings,
 * bullet points, and consistent typography.
 */
@Service
public class DocxGenerationService {

    // Color constants (dark navy for headings, gray for accents)
    private static final String HEADING_COLOR = "1B2A4A";
    private static final String ACCENT_COLOR = "555555";
    private static final String DIVIDER_COLOR = "CCCCCC";

    /**
     * Generates a professional DOCX resume from structured data.
     *
     * @param data       The structured tailored resume content.
     * @param targetPath Where to save the .docx file.
     */
    public void generateDocx(TailoredResumeResult data, Path targetPath) throws IOException {
        try (XWPFDocument document = new XWPFDocument()) {

            // Set narrow margins for more content space
            CTSectPr sectPr = document.getDocument().getBody().addNewSectPr();
            CTPageMar pageMar = sectPr.addNewPgMar();
            pageMar.setTop(BigInteger.valueOf(720));    // 0.5 inch
            pageMar.setBottom(BigInteger.valueOf(720));
            pageMar.setLeft(BigInteger.valueOf(1080));   // 0.75 inch
            pageMar.setRight(BigInteger.valueOf(1080));

            // --- Header: Name ---
            if (data.getName() != null && !data.getName().isBlank()) {
                XWPFParagraph namePara = document.createParagraph();
                namePara.setAlignment(ParagraphAlignment.CENTER);
                namePara.setSpacingAfter(60);
                XWPFRun nameRun = namePara.createRun();
                nameRun.setText(data.getName().toUpperCase());
                nameRun.setBold(true);
                nameRun.setFontSize(22);
                nameRun.setFontFamily("Calibri");
                nameRun.setColor(HEADING_COLOR);
            }

            // --- Contact Info Line ---
            String contactLine = buildContactLine(data.getEmail(), data.getPhone(), data.getLocation());
            if (!contactLine.isBlank()) {
                XWPFParagraph contactPara = document.createParagraph();
                contactPara.setAlignment(ParagraphAlignment.CENTER);
                contactPara.setSpacingAfter(200);
                XWPFRun contactRun = contactPara.createRun();
                contactRun.setText(contactLine);
                contactRun.setFontSize(10);
                contactRun.setFontFamily("Calibri");
                contactRun.setColor(ACCENT_COLOR);
            }

            // --- Professional Summary ---
            if (data.getSummary() != null && !data.getSummary().isBlank()) {
                addSectionHeading(document, "PROFESSIONAL SUMMARY");
                addDivider(document);
                XWPFParagraph summaryPara = document.createParagraph();
                summaryPara.setSpacingAfter(200);
                XWPFRun summaryRun = summaryPara.createRun();
                summaryRun.setText(data.getSummary());
                summaryRun.setFontSize(10);
                summaryRun.setFontFamily("Calibri");
            }

            // --- Skills ---
            if (data.getSkills() != null && !data.getSkills().isEmpty()) {
                addSectionHeading(document, "SKILLS");
                addDivider(document);
                XWPFParagraph skillsPara = document.createParagraph();
                skillsPara.setSpacingAfter(200);
                XWPFRun skillsRun = skillsPara.createRun();
                skillsRun.setText(String.join("  •  ", data.getSkills()));
                skillsRun.setFontSize(10);
                skillsRun.setFontFamily("Calibri");
            }

            // --- Experience ---
            if (data.getExperience() != null && !data.getExperience().isEmpty()) {
                addSectionHeading(document, "EXPERIENCE");
                addDivider(document);

                for (TailoredResumeResult.ExperienceEntry exp : data.getExperience()) {
                    // Job title + Company on same line, duration right-aligned
                    XWPFParagraph titlePara = document.createParagraph();
                    titlePara.setSpacingBefore(120);
                    titlePara.setSpacingAfter(40);

                    XWPFRun titleRun = titlePara.createRun();
                    String titleText = safe(exp.getTitle());
                    if (exp.getCompany() != null && !exp.getCompany().isBlank()) {
                        titleText += "  |  " + exp.getCompany();
                    }
                    titleRun.setText(titleText);
                    titleRun.setBold(true);
                    titleRun.setFontSize(11);
                    titleRun.setFontFamily("Calibri");
                    titleRun.setColor(HEADING_COLOR);

                    if (exp.getDuration() != null && !exp.getDuration().isBlank()) {
                        // Add a tab and the duration on the same paragraph
                        XWPFRun durationRun = titlePara.createRun();
                        durationRun.addTab();
                        durationRun.setText(exp.getDuration());
                        durationRun.setFontSize(10);
                        durationRun.setFontFamily("Calibri");
                        durationRun.setColor(ACCENT_COLOR);
                        durationRun.setItalic(true);
                    }

                    // Bullet points
                    if (exp.getBullets() != null) {
                        for (String bullet : exp.getBullets()) {
                            addBulletPoint(document, bullet);
                        }
                    }
                }
            }

            // --- Projects ---
            if (data.getProjects() != null && !data.getProjects().isEmpty()) {
                addSectionHeading(document, "PROJECTS");
                addDivider(document);

                for (TailoredResumeResult.ProjectEntry project : data.getProjects()) {
                    XWPFParagraph projPara = document.createParagraph();
                    projPara.setSpacingBefore(100);
                    projPara.setSpacingAfter(40);

                    XWPFRun projNameRun = projPara.createRun();
                    projNameRun.setText(safe(project.getName()));
                    projNameRun.setBold(true);
                    projNameRun.setFontSize(11);
                    projNameRun.setFontFamily("Calibri");
                    projNameRun.setColor(HEADING_COLOR);

                    if (project.getTechnologies() != null && !project.getTechnologies().isEmpty()) {
                        XWPFRun techRun = projPara.createRun();
                        techRun.setText("  [" + String.join(", ", project.getTechnologies()) + "]");
                        techRun.setFontSize(9);
                        techRun.setFontFamily("Calibri");
                        techRun.setColor(ACCENT_COLOR);
                        techRun.setItalic(true);
                    }

                    if (project.getDescription() != null && !project.getDescription().isBlank()) {
                        addBulletPoint(document, project.getDescription());
                    }
                }
            }

            // --- Education ---
            if (data.getEducation() != null && !data.getEducation().isEmpty()) {
                addSectionHeading(document, "EDUCATION");
                addDivider(document);

                for (TailoredResumeResult.EducationEntry edu : data.getEducation()) {
                    XWPFParagraph eduPara = document.createParagraph();
                    eduPara.setSpacingBefore(80);
                    eduPara.setSpacingAfter(40);

                    XWPFRun degreeRun = eduPara.createRun();
                    degreeRun.setText(safe(edu.getDegree()));
                    degreeRun.setBold(true);
                    degreeRun.setFontSize(11);
                    degreeRun.setFontFamily("Calibri");

                    if (edu.getInstitution() != null && !edu.getInstitution().isBlank()) {
                        XWPFRun instRun = eduPara.createRun();
                        instRun.setText("  —  " + edu.getInstitution());
                        instRun.setFontSize(10);
                        instRun.setFontFamily("Calibri");
                        instRun.setColor(ACCENT_COLOR);
                    }

                    if (edu.getYear() != null && !edu.getYear().isBlank()) {
                        XWPFRun yearRun = eduPara.createRun();
                        yearRun.addTab();
                        yearRun.setText(edu.getYear());
                        yearRun.setFontSize(10);
                        yearRun.setFontFamily("Calibri");
                        yearRun.setColor(ACCENT_COLOR);
                        yearRun.setItalic(true);
                    }
                }
            }

            // --- Certifications ---
            if (data.getCertifications() != null && !data.getCertifications().isEmpty()) {
                addSectionHeading(document, "CERTIFICATIONS");
                addDivider(document);

                for (String cert : data.getCertifications()) {
                    addBulletPoint(document, cert);
                }
            }

            // Write to file
            java.io.File file = targetPath.toFile();
            if (file.getParentFile() != null && !file.getParentFile().exists()) {
                file.getParentFile().mkdirs();
            }

            try (FileOutputStream fos = new FileOutputStream(file)) {
                document.write(fos);
            }
        }
    }

    // --- Helper methods ---

    private void addSectionHeading(XWPFDocument document, String text) {
        XWPFParagraph heading = document.createParagraph();
        heading.setSpacingBefore(280);
        heading.setSpacingAfter(40);
        XWPFRun run = heading.createRun();
        run.setText(text);
        run.setBold(true);
        run.setFontSize(12);
        run.setFontFamily("Calibri");
        run.setColor(HEADING_COLOR);
    }

    private void addDivider(XWPFDocument document) {
        XWPFParagraph divider = document.createParagraph();
        divider.setSpacingAfter(80);
        divider.setBorderBottom(Borders.SINGLE);
    }

    private void addBulletPoint(XWPFDocument document, String text) {
        XWPFParagraph para = document.createParagraph();
        para.setSpacingAfter(40);
        para.setIndentationLeft(360); // 0.25 inch indent

        XWPFRun bulletRun = para.createRun();
        bulletRun.setText("•  " + text);
        bulletRun.setFontSize(10);
        bulletRun.setFontFamily("Calibri");
    }

    private String buildContactLine(String email, String phone, String location) {
        StringBuilder sb = new StringBuilder();
        if (email != null && !email.isBlank()) sb.append(email);
        if (phone != null && !phone.isBlank()) {
            if (sb.length() > 0) sb.append("  |  ");
            sb.append(phone);
        }
        if (location != null && !location.isBlank()) {
            if (sb.length() > 0) sb.append("  |  ");
            sb.append(location);
        }
        return sb.toString();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
