import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiRequest } from "../src/lib/api";

describe("web apiRequest client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("unwraps successful API envelopes", async () => {
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { status: "ok" },
          meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await apiRequest<{ status: string }>("/health");
    expect(result.data.status).toBe("ok");
    expect(result.meta?.total).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("throws ApiRequestError on failed responses", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Please sign in" },
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(apiRequest("/api/auth/me")).rejects.toBeInstanceOf(ApiRequestError);
    await expect(apiRequest("/api/auth/me")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Please sign in",
    });
  });
});
