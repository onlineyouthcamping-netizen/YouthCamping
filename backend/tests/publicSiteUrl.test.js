describe("getPublicSiteBaseUrl", () => {
  const original = { ...process.env };

  afterEach(() => {
    for (const key of [
      "PUBLIC_SITE_URL",
      "FRONTEND_URL",
      "CLIENT_URL",
      "NEXT_PUBLIC_SITE_URL",
    ]) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
    jest.resetModules();
  });

  function load() {
    jest.resetModules();
    return require("../src/utils/publicSiteUrl").getPublicSiteBaseUrl();
  }

  it("prefers PUBLIC_SITE_URL when it is the .online origin", () => {
    process.env.PUBLIC_SITE_URL = "https://youthcamping.online";
    process.env.FRONTEND_URL = "https://www.youthcamping.in";
    expect(load()).toBe("https://youthcamping.online");
  });

  it("skips leftover .in env values", () => {
    process.env.PUBLIC_SITE_URL = "https://www.youthcamping.in";
    process.env.FRONTEND_URL = "https://youthcamping.online/";
    expect(load()).toBe("https://youthcamping.online");
  });

  it("falls back to the canonical public site", () => {
    delete process.env.PUBLIC_SITE_URL;
    delete process.env.FRONTEND_URL;
    delete process.env.CLIENT_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(load()).toBe("https://youthcamping.online");
  });
});
