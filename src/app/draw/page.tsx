import DrawingDisplay from "@/components/DrawingDisplay";

export default function DrawPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Real-time Drawing Demo</h1>

      <div className="mb-6 max-w-2xl">
        <p className="text-gray-700">
          This demo shows real-time drawing between a mobile device and this web
          app. Use your mobile device to draw on the canvas, and see the result
          appear here in real-time.
        </p>
        <p className="mt-2 text-gray-700">
          To get started, visit the URL shown below on your mobile device or
          scan the QR code.
        </p>
      </div>

      <DrawingDisplay width={800} height={500} />
    </div>
  );
}
