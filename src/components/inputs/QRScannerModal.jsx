// QRScannerModal.js
import { useState } from "react";
import { QrReader } from "react-qr-reader";

export default function QRScannerModal({ open, onClose, onScan }) {
    return open ? (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-neutral-900 p-6 rounded-lg shadow-xl relative flex flex-col items-center">
                <button
                    className="absolute top-2 right-2 text-neutral-400 hover:text-orange-500"
                    onClick={onClose}
                >
                    ×
                </button>
                <h2 className="text-lg font-bold mb-3 text-neutral-100">
                    Scan QR Code
                </h2>
                <div className="w-64 h-64 rounded overflow-hidden bg-black">
                    <QrReader
                        constraints={{ facingMode: "environment" }}
                        onResult={(result, error) => {
                            if (result?.text) {
                                onScan(result.text);
                            }
                        }}
                        style={{ width: "100%" }}
                    />
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                    Point your camera at the QR code.
                </p>
            </div>
        </div>
    ) : null;
}
