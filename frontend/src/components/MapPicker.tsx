import { useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationMarker({ setPosition: any }) {
    const [markerPos, setMarkerPos] = useState(null);

    useMapEvents({
        click(e: any) {
            setMarkerPos(e.latlng);
            setPosition(e.latlng);
        },
    });

    return markerPos === null ? null : (
        <Marker position={markerPos}>
            <Popup>
                <b>Vĩ độ:</b> {markerPos.lat.toFixed(6)} <br />
                <b>Kinh độ:</b> {markerPos.lng.toFixed(6)}
            </Popup>
        </Marker>
    );
}

export default function MapPicker({ onPick: any }) {
    const [position, setPosition] = useState(null);

    return (
        <div>
            <MapContainer
                center={[10.762622, 106.660172]}
                zoom={13}
                style={{ height: "200px", width: "100%", borderRadius: "12px" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMarker setPosition={setPosition} />
            </MapContainer>

            {/* <div className="flex flex-col items-start mt-4">
                <p>
                    📍 <b>Vĩ độ:</b>{" "}
                    {position ? position.lat.toFixed(6) : "Chưa chọn"}
                </p>
                <p>
                    📍 <b>Kinh độ:</b>{" "}
                    {position ? position.lng.toFixed(6) : "Chưa chọn"}
                </p>
            </div> */}
        </div>
    );
}
