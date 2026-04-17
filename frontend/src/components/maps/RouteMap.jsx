import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from "react-leaflet";
import { getCityCoordinates } from "../../utils/geo";

export default function RouteMap({ from, to, height = 320, trailPositions = null }) {
  const fromCoord = getCityCoordinates(from);
  const toCoord = getCityCoordinates(to);

  if (!fromCoord || !toCoord) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed border-[#D1D5DB] bg-white text-center" style={{ height }}>
        <div>
          <p className="text-base font-semibold text-gm-green">Map unavailable</p>
          <p className="text-sm text-[#1F2937]">Coordinates not found for {from} → {to}</p>
        </div>
      </div>
    );
  }

  const center = [(fromCoord[0] + toCoord[0]) / 2, (fromCoord[1] + toCoord[1]) / 2];
  const bounds = [fromCoord, toCoord];

  return (
    <div className="overflow-hidden rounded-lg border border-[#D1D5DB]" style={{ height }}>
      <MapContainer center={center} bounds={bounds} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={[fromCoord, toCoord]} pathOptions={{ color: "#22c55e", weight: 5 }} />
        {trailPositions && trailPositions.length >= 2 && (
          <Polyline positions={trailPositions} pathOptions={{ color: "#7c3aed", weight: 4, dashArray: "8 8", opacity: 0.9 }} />
        )}
        <CircleMarker center={fromCoord} radius={8} pathOptions={{ color: "#1e3a5f", fillColor: "#1e3a5f", fillOpacity: 1 }}>
          <Tooltip direction="top" offset={[0, -8]} permanent>{from}</Tooltip>
        </CircleMarker>
        <CircleMarker center={toCoord} radius={8} pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 1 }}>
          <Tooltip direction="top" offset={[0, -8]} permanent>{to}</Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
