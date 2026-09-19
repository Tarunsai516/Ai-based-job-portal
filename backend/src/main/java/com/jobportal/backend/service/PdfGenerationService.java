package com.jobportal.backend.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

@Service
public class PdfGenerationService {

    /**
     * Generates a simple PDF document from text and saves it to the specified path.
     *
     * @param text The tailored resume text.
     * @param targetPath The destination file path.
     * @throws IOException If file creation fails.
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
}
