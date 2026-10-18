import { describe, expect, it } from "vitest";
import {
  chatPostSchema,
  chatReactionSchema,
  registerSchema,
} from "@/lib/validation";

describe("validation schemas", () => {
  it("keeps the register message for missing required fields", () => {
    const result = registerSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("همه فیلدها الزامی هستند");
    }
  });

  it("keeps distinct chat messages for missing and invalid content", () => {
    const missing = chatPostSchema.safeParse({});
    const invalid = chatPostSchema.safeParse({ content: null });

    expect(missing.success).toBe(false);
    expect(invalid.success).toBe(false);
    if (!missing.success && !invalid.success) {
      expect(missing.error.issues[0]?.message).toBe("متن پیام را بنویس");
      expect(invalid.error.issues[0]?.message).toBe("درخواست نامعتبر است");
    }
  });

  it("keeps the custom message for invalid chat reactions", () => {
    const result = chatReactionSchema.safeParse({ type: 2 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("واکنش نامعتبر است");
    }
  });
});
