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
  const parsedMap: Record<string, string | Record<string, string>> = {};
  const parsedRule: SigmaValidationResult["parsedRule"] = {
    logsource: {},
    detectionKeys: []
  };

  let currentSection = "";
  let detectionKeysFound: string[] = [];

  // Basic YAML Parser & Syntax Checker
  lines.forEach((rawLine, index) => {
    const lineNum = index + 1;
    const line = rawLine.trim();
    
    // Skip empty or comment lines
    if (!line || line.startsWith("#")) return;

    // Check syntax line formatting (key: value or section header)
    if (!line.includes(":") && !line.startsWith("-")) {
      errors.push({
        type: "error",
        line: lineNum,
        message: `Syntax error: Line ${lineNum} does not appear to be a valid key:value pair or list item.`,
        suggestion: "Ensure syntax uses 'key: value' or '- item' format."
      });
      return;
    }

    // Top-level section detector (non-indented key)
    if (!rawLine.startsWith(" ") && !rawLine.startsWith("\t") && line.includes(":")) {
      const parts = line.split(":");
      const key = parts[0].trim();
      const val = parts.slice(1).join(":").trim();

      currentSection = key;

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
    } else if ((rawLine.startsWith("  ") || rawLine.startsWith("\t")) && line.includes(":")) {
      // Sub-key under a section
      const parts = line.split(":");
      const subKey = parts[0].trim();
      const subVal = parts.slice(1).join(":").trim();

      if (currentSection === "logsource" && parsedRule.logsource) {
        parsedRule.logsource[subKey] = subVal.replace(/^["']|["']$/g, "");
      } else if (currentSection === "detection") {
        if (subKey === "condition") {
          parsedRule.condition = subVal.replace(/^["']|["']$/g, "");
        } else {
          detectionKeysFound.push(subKey);
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
      message: "Missing required top-level key 'title'.",
      suggestion: "Add 'title: Describing the threat pattern'"
    });
  } else if (parsedRule.title.length < 5) {
    warnings.push({
      type: "warning",
      field: "title",
      message: "Rule title is very short.",
      suggestion: "Provide a clear, descriptive title for SIEM alerts."
    });
  }

  // 2. Validate 'id'
  if (!parsedRule.id) {
    warnings.push({
      type: "warning",
      field: "id",
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
      message: "Missing 'status' key.",
      suggestion: "Set 'status: production' or 'status: test'."
    });
  } else if (!validStatuses.includes(parsedRule.status.toLowerCase())) {
    warnings.push({
      type: "warning",
      field: "status",
      message: `Non-standard status '${parsedRule.status}'.`,
      suggestion: `Use one of: ${validStatuses.join(", ")}`
    });
  }

  // 4. Validate 'logsource'
  if (!yamlContent.includes("logsource:")) {
    errors.push({
      type: "error",
      field: "logsource",
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
      message: "Missing required section 'detection:'.",
      suggestion: "Add a 'detection:' section with selection patterns and a 'condition'."
    });
  } else {
    if (!parsedRule.condition) {
      errors.push({
        type: "error",
        field: "detection.condition",
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
            message: `Detection block defines selection key '${key}', but it is not explicitly referenced in condition '${parsedRule.condition}'.`,
            suggestion: `Update condition to include '${key}' or remove unused selection.`
          });
        }
      });
    }

    if (detectionKeysFound.length === 0) {
      errors.push({
        type: "error",
        field: "detection",
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
      message: "Missing 'level' severity field.",
      suggestion: "Specify 'level: high' or 'level: critical' for SIEM routing."
    });
  } else if (!validLevels.includes(parsedRule.level.toLowerCase())) {
    warnings.push({
      type: "warning",
      field: "level",
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
