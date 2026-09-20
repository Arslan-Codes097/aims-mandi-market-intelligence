import type { CropGradingMetadata } from "@/types/chat";

const HEALTHY_KEYWORDS = [
    "none",
    "no",
    "healthy",
    "no disease",
    "no disease detected",
    "no symptoms",
    "no visible disease",
    "nil",
    "n/a",
    "clean",
    "clear",
    "not detected",
    "none detected",
    "negative",
    "disease-free",
    "disease free",
];

function isHealthyDiseaseValue(val?: string | null): boolean {
    if (!val) return true;
    const lower = val.toLowerCase().trim();
    return HEALTHY_KEYWORDS.some((kw) => lower === kw || lower.startsWith(kw));
}

export function normalizeGrade(gradeStr?: string): "Grade A" | "Grade B" | "Grade C" | string {
    if (!gradeStr) return "Grade A";
    const cleaned = gradeStr.replace(/[*_`]/g, "").trim();
    const upper = cleaned.toUpperCase();

    if (
        upper.includes("GRADE C") ||
        upper === "C" ||
        upper.startsWith("C ") ||
        upper.includes("SUBSTANDARD") ||
        upper.includes("POOR") ||
        upper.includes("REJECT")
    ) {
        return "Grade C";
    }
    if (
        upper.includes("GRADE B") ||
        upper === "B" ||
        upper.startsWith("B ") ||
        upper.includes("STANDARD") ||
        upper.includes("FAIR")
    ) {
        return "Grade B";
    }
    if (
        upper.includes("GRADE A") ||
        upper === "A" ||
        upper.startsWith("A ") ||
        upper.includes("PREMIUM") ||
        upper.includes("EXPORT")
    ) {
        return "Grade A";
    }

    return cleaned;
}

export function parseCropGrading(
    content: string,
    existingMetadata?: CropGradingMetadata | null
): { grading: CropGradingMetadata | null; cleanContent: string } {
    let clean = content || "";
    let extracted: Partial<CropGradingMetadata> = existingMetadata ? { ...existingMetadata } : {};

    // Harmonize backend snake_case keys if present
    if (existingMetadata) {
        const anyMeta = existingMetadata as any;
        if (!extracted.disease && anyMeta.disease_name) {
            extracted.disease = anyMeta.disease_name;
        }
        if (!extracted.crop && anyMeta.commodity) {
            extracted.crop = anyMeta.commodity;
        }
        if (extracted.diseaseDetected === undefined && anyMeta.has_disease_or_defect !== undefined) {
            extracted.diseaseDetected = Boolean(anyMeta.has_disease_or_defect);
        }
    }

    // 1. Try to parse embedded JSON block (e.g., ```json { "grade": "A", ... } ```)
    const jsonBlockRegex = /```(?:json|crop_grading|grading|crop-grading)?\s*(\{[\s\S]*?"grade"[\s\S]*?\})\s*```/i;
    const jsonMatch = clean.match(jsonBlockRegex);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.grade) {
                extracted = { ...extracted, ...parsed };
                // Remove the raw JSON block from displayed content
                clean = clean.replace(jsonMatch[0], "").trim();
            }
        } catch {
            // ignore invalid JSON
        }
    }

    // 2. Bracket tag parsing: [GRADE: ...], [CROP: ...], [DISEASE: ...], [CONFIDENCE: ...]
    const gradeTagMatch = clean.match(/\[(?:QUALITY_)?GRADE:\s*([^\]]+)\]/i);
    if (gradeTagMatch) {
        extracted.grade = gradeTagMatch[1].trim();
        clean = clean.replace(gradeTagMatch[0], "");
    }

    const cropTagMatch = clean.match(/\[CROP:\s*([^\]]+)\]/i);
    if (cropTagMatch) {
        extracted.crop = cropTagMatch[1].trim();
        clean = clean.replace(cropTagMatch[0], "");
    }

    const diseaseTagMatch = clean.match(/\[(?:DISEASE|DISEASE_DETECTED|DISEASE_WARNING):\s*([^\]]+)\]/i);
    if (diseaseTagMatch) {
        extracted.disease = diseaseTagMatch[1].trim();
        clean = clean.replace(diseaseTagMatch[0], "");
    }

    const confidenceTagMatch = clean.match(/\[CONFIDENCE:\s*([^\]]+)\]/i);
    if (confidenceTagMatch) {
        extracted.confidence = confidenceTagMatch[1].trim();
        clean = clean.replace(confidenceTagMatch[0], "");
    }

    const defectsTagMatch = clean.match(/\[DEFECTS?:\s*([^\]]+)\]/i);
    if (defectsTagMatch) {
        const defectList = defectsTagMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
        extracted.defects = defectList;
        clean = clean.replace(defectsTagMatch[0], "");
    }

    // 3. XML style tags: <grade>...</grade>, <disease>...</disease>, etc.
    const xmlGradeMatch = clean.match(/<grade>([\s\S]*?)<\/grade>/i);
    if (xmlGradeMatch) {
        extracted.grade = xmlGradeMatch[1].trim();
        clean = clean.replace(xmlGradeMatch[0], "");
    }
    const xmlDiseaseMatch = clean.match(/<disease>([\s\S]*?)<\/disease>/i);
    if (xmlDiseaseMatch) {
        extracted.disease = xmlDiseaseMatch[1].trim();
        clean = clean.replace(xmlDiseaseMatch[0], "");
    }
    const xmlCropMatch = clean.match(/<crop>([\s\S]*?)<\/crop>/i);
    if (xmlCropMatch) {
        extracted.crop = xmlCropMatch[1].trim();
        clean = clean.replace(xmlCropMatch[0], "");
    }

    // 4. Markdown line patterns if grade hasn't been found yet:
    // e.g. "**Quality Grade**: Grade A" or "### Grade: A" or "Grade: Grade B"
    if (!extracted.grade) {
        const lineGradeMatch = clean.match(
            /(?:^|\n)(?:[*#_>\s-]*)(?:Quality\s+)?Grade(?:[*_:\s-]+)+([A-Za-z0-9\+\-\s]+?)(?=(?:[*_\n,]|$))/i
        );
        if (lineGradeMatch) {
            const candidate = lineGradeMatch[1].trim();
            // Validate that candidate looks like a grade (A, B, C, Grade A, etc.)
            if (/^(?:Grade\s*)?[A-D][\+\-]?$/i.test(candidate) || /^(?:Premium|Standard|Substandard)$/i.test(candidate)) {
                extracted.grade = candidate;
            }
        }
    }

    if (!extracted.disease) {
        const lineDiseaseMatch = clean.match(
            /(?:^|\n)(?:[*#_>\s-]*)(?:Disease(?:\s+(?:Detection|Detected|Warning|Status))?|Health\s+Status)(?:[*_:\s-]+)+([^\n\r*]+)/i
        );
        if (lineDiseaseMatch) {
            extracted.disease = lineDiseaseMatch[1].trim();
        }
    }

    if (!extracted.crop) {
        const lineCropMatch = clean.match(
            /(?:^|\n)(?:[*#_>\s-]*)(?:Crop|Commodity)(?:[*_:\s-]+)+([^\n\r*]+)/i
        );
        if (lineCropMatch) {
            extracted.crop = lineCropMatch[1].trim();
        }
    }

    if (!extracted.confidence) {
        const lineConfMatch = clean.match(
            /(?:^|\n)(?:[*#_>\s-]*)(?:Confidence|Accuracy)(?:[*_:\s-]+)+([0-9]+(?:\.[0-9]+)?%?)/i
        );
        if (lineConfMatch) {
            extracted.confidence = lineConfMatch[1].trim();
        }
    }

    // If no grade found anywhere, return null
    if (!extracted.grade) {
        return { grading: null, cleanContent: clean.trim() };
    }

    // Normalize grade and disease
    const normalizedGrade = normalizeGrade(extracted.grade);
    const rawDisease = extracted.disease;
    const isHealthy = isHealthyDiseaseValue(rawDisease);
    const diseaseDetected = rawDisease ? !isHealthy : false;

    const gradingResult: CropGradingMetadata = {
        grade: normalizedGrade,
        crop: extracted.crop,
        variety: extracted.variety,
        confidence: extracted.confidence,
        qualityScore: extracted.qualityScore,
        disease: diseaseDetected ? rawDisease : "None detected (Healthy)",
        diseaseDetected,
        diseaseSeverity: extracted.diseaseSeverity,
        defects: extracted.defects,
        shelfLifeDays: extracted.shelfLifeDays,
        recommendations: extracted.recommendations,
        details: extracted.details,
    };

    return {
        grading: gradingResult,
        cleanContent: clean.trim(),
    };
}
