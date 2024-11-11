import Banner from "../models/Banner";

export const getBannersService = async () => {
    // Fetch all banners from the database
    const banners = await Banner.findAll();
    return banners;
};

export const createBannerService = async (payload: any) => {
    // Create a new banner in the database
    const banner = await Banner.create(payload);
    return banner;
};

export const updateBannerService = async (id: string, payload: any) => {
    // Find the banner by primary key (id)
    const banner = await Banner.findByPk(id);
    if (!banner) {
        throw new Error("Banner not found");
    }
    // Update the banner with the provided payload
    return await banner.update(payload);
};

export const deleteBannerService = async (id: string) => {
    // Find the banner by primary key (id)
    const banner = await Banner.findByPk(id);
    if (!banner) {
        throw new Error("Banner not found");
    }
    // Destroy the banner (delete it)
    await banner.destroy();
    return;
};
