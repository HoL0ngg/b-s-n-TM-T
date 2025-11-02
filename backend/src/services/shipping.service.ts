import axios from 'axios';

// --- Hàm 1: Lấy tọa độ (Bạn đã quen thuộc) ---
async function getCoordinates(address: string): Promise<{ lon: string, lat: string } | null> {
    try {
        const query = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

        const response = await axios.get(url, {
            headers: { 'User-Agent': 'MyApp (my-email@example.com)' } // Nominatim yêu cầu User-Agent
        });

        if (response.data && response.data.length > 0) {
            return { lon: response.data[0].lon, lat: response.data[0].lat };
        }
        return null;
    } catch (error) {
        console.error("Lỗi Geocoding:", error);
        return null;
    }
}

// --- Hàm 2: Lấy khoảng cách lái xe (Dùng OSRM) ---
async function getDrivingDistance(
    coords1: { lon: string, lat: string },
    coords2: { lon: string, lat: string }
): Promise<number | null> {
    try {
        // Định dạng: {lon},{lat};{lon},{lat}
        const coordsString = `${coords1.lon},${coords1.lat};${coords2.lon},${coords2.lat}`;
        const url = `http://router.project-osrm.org/route/v1/driving/${coordsString}?overview=false`;

        const response = await axios.get(url);

        // OSRM trả về khoảng cách tính bằng MÉT
        const distanceInMeters = response.data?.routes[0]?.distance;

        if (distanceInMeters) {
            return distanceInMeters;
        }
        return null;
    } catch (error) {
        console.error("Lỗi OSRM Routing:", error);
        return null;
    }
}

// --- Hàm 3: HÀM CHÍNH (Gộp lại) ---
export async function calculateShippingFee(warehouseAddress: string, deliveryAddress: string) {
    console.log("Đang lấy tọa độ kho...");
    const warehouseCoords = await getCoordinates(warehouseAddress);

    console.log("Đang lấy tọa độ khách...");
    const deliveryCoords = await getCoordinates(deliveryAddress);

    if (!warehouseCoords || !deliveryCoords) {
        throw new Error("Không tìm thấy địa chỉ");
    }

    console.log("Đang tính khoảng cách lái xe...");
    const distanceInMeters = await getDrivingDistance(warehouseCoords, deliveryCoords);

    if (distanceInMeters === null) {
        throw new Error("Không thể tính toán tuyến đường");
    }

    // --- LOGIC TÍNH PHÍ CỦA BẠN ---
    const distanceInKm = distanceInMeters / 1000;
    let shippingFee = 0;

    // Ví dụ: 5,000đ/km
    const feePerKm = 5000;
    shippingFee = distanceInKm * feePerKm;

    // Làm tròn
    shippingFee = Math.round(shippingFee / 1000) * 1000;

    // Phí cố định tối thiểu
    if (shippingFee < 20000) {
        shippingFee = 20000;
    }

    return {
        distanceKm: distanceInKm.toFixed(2),
        shippingFee: shippingFee
    };
}