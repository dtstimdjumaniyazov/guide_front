import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from 'react-i18next'

export default function QRSection() {
    const { t } = useTranslation("QR")
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-lg font-semibold">{t("QR")}</p>
      <QRCodeCanvas
        value="https://child-guide.co.uz/"
        size={150}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin={true}
      />
      <a
        href="https://child-guide.co.uz/"
        className="text-blue-600 hover:underline mt-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://www.child-guide.co.uz/
      </a>
    </div>
  );
}
