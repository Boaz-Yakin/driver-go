const url = "https://driver-go-seven.vercel.app/api/deliveries";
const payload = {
  driver_id: null,
  status: "PENDING",
  origin_address: "Atlanta, GA",
  destination_address: "Savannah, GA",
  recipient_phone: "+1234567890",
  tracking_token: "TEST-" + Math.floor(Math.random() * 10000)
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
}).then(r => r.json()).then(console.log).catch(console.error);
