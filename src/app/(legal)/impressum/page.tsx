import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum - Tutor Me Good",
  description: "Legal information and contact details",
};

export default function ImpressumPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Impressum</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-bold">Contact Information</h2>
          <div className="mt-2 space-y-1">
            <p>Maximilian Gerer</p>
            <p>c/o KFA City-Haus Gerer GmbH & Co. KG</p>
            <p>Eichendorffstr. 1</p>
            <p>83301 Traunreut</p>
            <p>Germany</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">Responsible for Content</h2>
          <p className="mt-2">
            According to § 5 TMG (German Telemedia Act), the person responsible
            for the content of this website is Maximilian Gerer.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
