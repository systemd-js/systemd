export type INIData = Record<string, Record<string, string[] | boolean | number | string>>;

function readValue(value: string): boolean | number | string {
  const trimmed = value.trim();
  if (
    trimmed === "true" || trimmed === "yes" || trimmed === "on"
  ) {
    return true;
  }
  if (trimmed === "1") {
    console.warn("Ambiguous boolean value: 1, use yes or true instead");
    return true;
  }
  if (
    trimmed === "false" || trimmed === "no" || trimmed === "off"
  ) {
    return false;
  }
  if (trimmed === "0") {
    console.warn("Ambiguous boolean value: 0, use no or false instead");
    return false;
  }

  const numberValue = Number(trimmed);
  return isFinite(numberValue) ? numberValue : trimmed;
}

/**
 * Opinionated parser for systemd configuration files.
 * @see https://www.freedesktop.org/software/systemd/man/latest/systemd.syntax.html#
 * Currently only supports basic INI files without quoting or escaping.
 */
export class INI {
  private readonly data: INIData;

  public constructor(data: INIData = {}) {
    this.data = data;
  }

  /**
   * Return INI as object
   */
  public toObject(): INIData {
    return this.data;
  }

  /**
   * Validate and parse object into INI
   */
  public static fromObject(data: unknown) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("", { cause: "Data is not object" });
    }
    const record = data as Record<string, unknown>;

    for (const section in record) {
      const sectionData = record[section];

      if (typeof sectionData !== "object" || sectionData === null || Array.isArray(sectionData)) {
        throw new Error("Invalid section data", {
          cause: `Section ${section} is not object`,
        });
      }
      for (const key in sectionData) {
        const sectionValue = (sectionData as Record<string, unknown>)[key];
        if (typeof sectionValue === "string") {
          continue;
        }
        if (typeof sectionValue === "undefined") {
          continue;
        }
        if (typeof sectionValue === "number") {
          continue;
        }
        if (typeof sectionValue === "boolean") {
          continue;
        }
        if (Array.isArray(sectionValue) && sectionValue.every(value => typeof value === "string")) {
          continue;
        }
        throw new Error(`Invalid data for key: ${key}, value: ${sectionValue as string}`, {
          cause: "Section value is not string, number, boolean or string[]",
        });
      }
    }
    return new INI(data as INIData);
  }

  /**
   * Parse string into INI
   */
  public static fromString(data: string) {
    if (!data) {
      throw new Error("Invalid data", { cause: "Data is empty" });
    }
    const iniData: INIData = {};
    const rawData = data
      .trim()
      .replaceAll(/\\\n/g, "")
      .replaceAll(/\\\r\n/g, "");

    const lines = rawData
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith("#"))
      .filter(line => !line.startsWith(";"));

    let currentSection: string | null = null;

    for (const line of lines) {
      if (line.startsWith("[") && line.endsWith("]")) {
        currentSection = line.slice(1, -1);
        iniData[currentSection] = {};
      }
      else {
        const equalIndex = line.indexOf("=");
        if (equalIndex === -1) {
          throw new Error(`Invalid line: ${line}`);
        }
        const key = line.slice(0, equalIndex).trim();
        const value = line.slice(equalIndex + 1).trim();

        if (!key || !value) {
          throw new Error(`Invalid line: ${line}`);
        }
        if (!currentSection || !rawData) {
          throw new Error(`Invalid ini: ${rawData}`);
        }

        const section = iniData[currentSection];
        const parsedValue = readValue(value);

        if (typeof parsedValue === "string") {
          const existingValue = section[key];
          if (existingValue) {
            if (Array.isArray(existingValue)) {
              existingValue.push(parsedValue);
            }
            else {
              if (typeof existingValue === "string") {
                section[key] = [existingValue, parsedValue];
              }
              else {
                throw new Error(`Invalid value for key: ${key}`);
              }
            }
            continue;
          }
        }

        section[key] = parsedValue;
      }
    }
    return new INI(iniData);
  }

  /**
   * Convert INI to string
   */
  public toString(): string {
    const result: string[] = [];
    for (const section in this.data) {
      result.push(`[${section}]\n`);

      const sectionData = this.data[section];
      for (const key in sectionData) {
        const sectionValue = sectionData[key];

        if (Array.isArray(sectionValue)) {
          for (const value of sectionValue) {
            result.push(`${key}=${value}\n`);
          }
        }
        else {
          if (sectionValue === true) {
            result.push(`${key}=yes\n`);
          }
          if (sectionValue === false) {
            result.push(`${key}=no\n`);
          }
          if (typeof sectionValue === "string") {
            result.push(`${key}=${sectionValue}\n`);
          }
          if (typeof sectionValue === "number") {
            result.push(`${key}=${sectionValue}\n`);
          }
        }
      }
      result.push("\n");
    }
    return result.join("").trim();
  }
}
