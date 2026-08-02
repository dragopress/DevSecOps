export interface SigmaValidationIssue {
  type: "error" | "warning";
  field?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface SigmaValidationResult {
  isValid: boolean;
  errors: SigmaValidationIssue[];
  warnings: SigmaValidationIssue[];
  parsedRule: {
    title?: string;
    id?: string;
    status?: string;
    description?: string;
    level?: string;
    logsource?: Record<string, string>;
    detectionKeys?: string[];
    condition?: string;
  };
}

/**
 * SigmaValidator - Validates Sigma YAML syntax and rule schema for SecOps detection engineering
 */
export function validateSigmaYaml(yamlContent: string): SigmaValidationResult {
  const errors: SigmaValidationIssue[] = [];
  const warnings: SigmaValidationIssue[] = [];
  
  const lines = yamlContent.split("\n");
  const parsedRule: SigmaValidationResult["parsedRule"] = {
    logsource: {},
    detectionKeys: []
  };

  let currentSection = "";
  let currentSectionLine = 1;
  let detectionKeysFound: string[] = [];
  const sectionLineNumbers: Record<string, number> = {};
  const topLevelKeysSeen = new Set<string>();

  // Basic YAML Parser & Syntax Checker
  lines.forEach((rawLine, index) => {
    const lineNum = index + 1;
    const line = rawLine.trim();
    
    // Skip empty or comment lines
    if (!line || line.startsWith("#")) return;

    // 1. Check for TAB indentation
    if (rawLine.startsWith("\t") || rawLine.includes(":\t") || (rawLine.includes("\t") && !rawLine.includes('"') && !rawLine.includes("'"))) {
      warnings.push({
        type: "warning",
        line: lineNum,
        message: `Line ${lineNum}: Tab character detected in indentation. YAML requires spaces.`,
        suggestion: "Replace tabs with 2 spaces for standard YAML compatibility."
      });
    }

    // 2. Check for quote mismatches
    const doubleQuotes = (rawLine.match(/"/g) || []).length;
    const singleQuotes = (rawLine.match(/'/g) || []).length;
    if (doubleQuotes % 2 !== 0) {
      errors.push({
        type: "error",
        line: lineNum,
        message: `Syntax error on line ${lineNum}: Unclosed double quote (") detected.`,
        suggestion: "Ensure every opening double quote has a matching closing quote."
      });
    }
    if (singleQuotes % 2 !== 0) {
      errors.push({
        type: "error",
        line: lineNum,
        message: `Syntax error on line ${lineNum}: Unclosed single quote (') detected.`,
        suggestion: "Ensure every opening single quote has a matching closing quote."
      });
    }

    // 3. Check for bracket mismatches [ ] and { }
    const openSquare = (rawLine.match(/\[/g) || []).length;
    const closeSquare = (rawLine.match(/\]/g) || []).length;
    if (openSquare !== closeSquare) {
      errors.push({
        type: "error",
        line: lineNum,
        message: `Syntax error on line ${lineNum}: Unbalanced square brackets [ ].`,
        suggestion: "Check list bracket syntax (e.g., ['item1', 'item2'])."
      });
    }

    // 4. Check syntax line formatting (key: value or section header or list item)
    if (!line.includes(":") && !line.startsWith("-")) {
      errors.push({
        type: "error",
        line: lineNum,
        message: `Syntax error: Line ${lineNum} ('${line.substring(0, 30)}') is not a valid key: value pair or list item.`,
        suggestion: "Format as 'key: value' or '- item'."
      });
      return;
    }

    // Check for key without space after colon (e.g. key:value instead of key: value) unless inside URL or quotes
    if (line.includes(":") && !line.startsWith("-")) {
      const colonIndex = line.indexOf(":");
      const afterColon = line.substring(colonIndex + 1);
      const keyPart = line.substring(0, colonIndex).trim();
      
      if (afterColon.length > 0 && !afterColon.startsWith(" ") && !afterColon.startsWith("/") && !afterColon.startsWith('"') && !afterColon.startsWith("'")) {
        warnings.push({
          type: "warning",
          line: lineNum,
          message: `Style warning on line ${lineNum}: Missing space after colon in '${keyPart}:'.`,
          suggestion: "Use 'key: value' with a space after the colon."
        });
      }
    }

    // Top-level section detector (non-indented key)
    if (!rawLine.startsWith(" ") && !rawLine.startsWith("\t") && line.includes(":")) {
      const parts = line.split(":");
      const key = parts[0].trim();
      const val = parts.slice(1).join(":").trim();

      if (topLevelKeysSeen.has(key) && key !== "falsepositives") {
        errors.push({
          type: "error",
          line: lineNum,
          message: `Duplicate top-level section '${key}' detected on line ${lineNum}.`,
          suggestion: `Combine '${key}' content into a single section.`
        });
      }
      topLevelKeysSeen.add(key);

      currentSection = key;
      currentSectionLine = lineNum;
      sectionLineNumbers[key] = lineNum;

      if (key === "title") {
        parsedRule.title = val.replace(/^["']|["']$/g, "");
      } else if (key === "id") {
        parsedRule.id = val.replace(/^["']|["']$/g, "");
      } else if (key === "status") {
        parsedRule.status = val.replace(/^["']|["']$/g, "");
      } else if (key === "description") {
        parsedRule.description = val.replace(/^["']|["']$/g, "");
      } else if (key === "level") {
        parsedRule.level = val.replace(/^["']|["']$/g, "");
      }
    } else if ((rawLine.startsWith("  ") || rawLine.startsWith(" ") || rawLine.startsWith("\t")) && line.includes(":")) {
      // Sub-key under a section
      const parts = line.split(":");
      const subKey = parts[0].trim();
      const subVal = parts.slice(1).join(":").trim();

      if (currentSection === "logsource" && parsedRule.logsource) {
        parsedRule.logsource[subKey] = subVal.replace(/^["']|["']$/g, "");
        sectionLineNumbers[`logsource.${subKey}`] = lineNum;
      } else if (currentSection === "detection") {
        if (subKey === "condition") {
          parsedRule.condition = subVal.replace(/^["']|["']$/g, "");
          sectionLineNumbers["condition"] = lineNum;
        } else {
          detectionKeysFound.push(subKey);
          sectionLineNumbers[`detection.${subKey}`] = lineNum;
        }
      }
    }
  });

  parsedRule.detectionKeys = detectionKeysFound;

  // 1. Validate 'title'
  if (!parsedRule.title) {
    errors.push({
      type: "error",
      field: "title",
      line: sectionLineNumbers["title"] || 1,
      message: "Missing required top-level key 'title'.",
      suggestion: "Add 'title: Describing the threat pattern' at top of YAML."
    });
  } else if (parsedRule.title.length < 5) {
    warnings.push({
      type: "warning",
      field: "title",
      line: sectionLineNumbers["title"] || 1,
      message: "Rule title is very short.",
      suggestion: "Provide a clear, descriptive title for SIEM alerts."
    });
  }

  // 2. Validate 'id'
  if (!parsedRule.id) {
    warnings.push({
      type: "warning",
      field: "id",
      line: sectionLineNumbers["id"] || 2,
      message: "Missing 'id' field (UUIDv4).",
      suggestion: "Generating a unique UUIDv4 is recommended for tracking Sigma rule revisions."
    });
  }

  // 3. Validate 'status'
  const validStatuses = ["production", "test", "experimental", "deprecated", "unsupported"];
  if (!parsedRule.status) {
    warnings.push({
      type: "warning",
      field: "status",
      line: sectionLineNumbers["status"] || 3,
      message: "Missing 'status' key.",
      suggestion: "Set 'status: production' or 'status: test'."
    });
  } else if (!validStatuses.includes(parsedRule.status.toLowerCase())) {
    warnings.push({
      type: "warning",
      field: "status",
      line: sectionLineNumbers["status"] || 3,
      message: `Non-standard status '${parsedRule.status}'.`,
      suggestion: `Use one of: ${validStatuses.join(", ")}`
    });
  }

  // 4. Validate 'logsource'
  if (!yamlContent.includes("logsource:")) {
    errors.push({
      type: "error",
      field: "logsource",
      line: 5,
      message: "Missing required section 'logsource:'.",
      suggestion: "Add a 'logsource' block specifying product, category, or service."
    });
  } else {
    const hasCategory = parsedRule.logsource && parsedRule.logsource["category"];
    const hasProduct = parsedRule.logsource && parsedRule.logsource["product"];
    const hasService = parsedRule.logsource && parsedRule.logsource["service"];

    if (!hasCategory && !hasProduct && !hasService) {
      warnings.push({
        type: "warning",
        field: "logsource",
        line: sectionLineNumbers["logsource"] || 6,
        message: "'logsource' block lacks 'category', 'product', or 'service'.",
        suggestion: "Specify 'product: zeek' or 'category: dns' for accurate router targeting."
      });
    }
  }

  // 5. Validate 'detection'
  if (!yamlContent.includes("detection:")) {
    errors.push({
      type: "error",
      field: "detection",
      line: 10,
      message: "Missing required section 'detection:'.",
      suggestion: "Add a 'detection:' section with selection patterns and a 'condition'."
    });
  } else {
    if (!parsedRule.condition) {
      errors.push({
        type: "error",
        field: "detection.condition",
        line: sectionLineNumbers["detection"] || 11,
        message: "Missing 'condition' within 'detection' block.",
        suggestion: "Add 'condition: selection' or 'condition: selection | count() > 5 by src_ip'."
      });
    } else {
      // Validate condition references
      detectionKeysFound.forEach(key => {
        if (!parsedRule.condition?.includes(key) && key !== "keywords") {
          warnings.push({
            type: "warning",
            field: "detection",
            line: sectionLineNumbers[`detection.${key}`] || sectionLineNumbers["condition"] || 12,
            message: `Selection key '${key}' defined, but not explicitly referenced in condition '${parsedRule.condition}'.`,
            suggestion: `Update condition to include '${key}' or remove unused selection.`
          });
        }
      });
    }

    if (detectionKeysFound.length === 0) {
      errors.push({
        type: "error",
        field: "detection",
        line: sectionLineNumbers["detection"] || 10,
        message: "'detection' block has no defined selections or keywords.",
        suggestion: "Add at least one selection pattern like 'selection:' or 'keywords:'."
      });
    }
  }

  // 6. Validate 'level'
  const validLevels = ["informational", "low", "medium", "high", "critical"];
  if (!parsedRule.level) {
    warnings.push({
      type: "warning",
      field: "level",
      line: sectionLineNumbers["level"] || lines.length,
      message: "Missing 'level' severity field.",
      suggestion: "Specify 'level: high' or 'level: critical' for SIEM routing."
    });
  } else if (!validLevels.includes(parsedRule.level.toLowerCase())) {
    warnings.push({
      type: "warning",
      field: "level",
      line: sectionLineNumbers["level"] || lines.length,
      message: `Unknown severity level '${parsedRule.level}'.`,
      suggestion: `Valid levels are: ${validLevels.join(", ")}`
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    parsedRule
  };
}
