import { useState, useRef, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { type LeafletMouseEvent } from "leaflet";
import { shortenAddress } from "../utils/validator";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// --- Component 1: Tự động di chuyển map ---
interface ChangeViewProps {
    center: [number, number];
    zoom: number;
}
function ChangeView({ center, zoom }: ChangeViewProps) {
    const map = useMap();
    map.flyTo(center, zoom);
    return null;
}

// --- Component 2: Bắt sự kiện click ---
interface LocationMarkerProps {
    setPosition: (pos: [number, number]) => void;
    setAddress: (address: string) => void; // Thêm prop để set address
    isMapClickRef: React.MutableRefObject<boolean>;
}

function LocationMarker({ setPosition, setAddress, isMapClickRef }: LocationMarkerProps) {

    // Lấy địa chỉ từ tọa độ
    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.display_name) {
                isMapClickRef.current = true;

                setAddress(data.display_name);
            }

            if (data && data.display_name) {
                // Cập nhật ô input ở component cha
                setAddress(shortenAddress(data.display_name));
            } else {
                setAddress("Không tìm thấy địa chỉ cho vị trí này");
            }
        } catch (error) {
            console.error("Lỗi khi reverse geocoding:", error);
            setAddress("Lỗi khi lấy địa chỉ");
        }
    };

    useMapEvents({
        click(e: LeafletMouseEvent) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            // 1. Set vị trí marker
            setPosition(newPos);
            // 2. Gọi hàm tìm địa chỉ từ tọa độ
            fetchAddressFromCoords(newPos[0], newPos[1]);
        },
    });

    return null;
}

// --- Props MapPicker ---
interface MapPickerProps {
    address: string; // Nhận địa chỉ từ cha
    city?: string;
    ward?: string;
    setAddress: (address: string) => void; // Nhận hàm cập nhật từ cha
}

// --- Component 3: Component Cha ---
export default function MapPicker({ address, city, ward, setAddress }: MapPickerProps) {
    const [position, setPosition] = useState<[number, number]>([
        10.760000, 106.681980,
    ]);
    const debounceTimeout = useRef<number | null>(null);
    const isMapClick = useRef(false);

    const searchGeocode = async (addressToSearch: string) => {
        if (addressToSearch.trim() === "") return;

        const fullQuery = [
            address,
            ward,
            city
        ]
            .filter(Boolean)
            .join(", ");
        try {
            const query = encodeURIComponent(fullQuery);
            const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setPosition([parseFloat(lat), parseFloat(lon)]);
            }
        } catch (error) {
            console.error("Lỗi khi tìm địa chỉ:", error);
        }
    };

    useEffect(() => {
        if (isMapClick.current) {
            // Nếu sự thay đổi này là do click,
            // reset cờ và KHÔNG làm gì cả (không search)
            isMapClick.current = false;
            return;
        }

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            // Chỉ tìm khi address không rỗng
            if (address.trim() !== "") {
                searchGeocode(address);
            }
        }, 1000); // Đợi 1s sau khi user ngừng gõ

        // Cleanup khi component unmount
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [address, city, ward]); // <-- Chỉ chạy lại khi 'address' prop thay đổi

    return (
        <div>
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: "240px", width: "100%", borderRadius: "12px" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={position}>
                    <Popup>
                        <b>Vĩ độ:</b> {position[0].toFixed(6)} <br />
                        <b>Kinh độ:</b> {position[1].toFixed(6)}
                    </Popup>
                </Marker>

                {/* 2. Truyền 'setAddress' xuống cho LocationMarker */}
                <LocationMarker setPosition={setPosition} setAddress={setAddress} isMapClickRef={isMapClick} />

                <ChangeView center={position} zoom={15} />
            </MapContainer>
        </div>
    );
}