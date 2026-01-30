"use server";

export async function getCoordinates(address: string) {
    if (!address) return null;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    "User-Agent": "SaloonBookApp/1.0"
                }
            }
        );
        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error("Error geocoding address:", error);
        return null;
    }
}
