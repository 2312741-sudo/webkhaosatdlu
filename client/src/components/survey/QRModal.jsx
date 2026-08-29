import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download, ExternalLink, QrCode } from 'lucide-react';
import Modal from '../common/Modal';
import { useToast } from '../../contexts/ToastContext';

export default function QRModal({ isOpen, onClose, survey }) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  if (!survey) return null;

  const surveyUrl = `${window.location.origin}/survey/${survey.access_token || survey.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    success('Đã sao chép đường link khảo sát vào clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('survey-qrcode-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_KhaoSat_${survey.access_token || survey.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      success('Tải ảnh mã QR thành công!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chia sẻ & Mã QR Khảo sát" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3">
          <h4 className="text-base font-bold text-slate-800 line-clamp-2">{survey.title}</h4>
          <p className="text-xs text-slate-500 mt-1">
            Mã truy cập: <span className="font-mono font-bold text-dlu-primary">{survey.access_token}</span>
          </p>
        </div>

        {/* QR Code Canvas */}
        <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-md my-3 relative group">
          <QRCodeSVG
            id="survey-qrcode-svg"
            value={surveyUrl}
            size={200}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>",
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        <p className="text-xs text-slate-500 mb-4 max-w-xs">
          Sinh viên có thể quét mã QR này bằng Camera điện thoại hoặc Zalo để tham gia khảo sát ngay.
        </p>

        {/* Action Link Box */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-2 mb-4">
          <input
            type="text"
            readOnly
            value={surveyUrl}
            className="bg-transparent text-xs text-slate-600 flex-1 px-2 py-1 focus:outline-none select-all font-mono"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 bg-dlu-primary text-white text-xs font-semibold rounded-lg hover:bg-dlu-royal transition shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handleDownloadQR}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <Download className="w-4 h-4 text-dlu-primary" />
            Tải ảnh mã QR (.PNG)
          </button>

          <a
            href={surveyUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-dlu-accent text-dlu-primary text-xs font-bold hover:bg-yellow-400 transition shadow"
          >
            <ExternalLink className="w-4 h-4" />
            Mở trang làm bài
          </a>
        </div>
      </div>
    </Modal>
  );
}
