"use client";

import { useEffect } from "react";

/** ถ้าหน้าคอนโซลไอทีเกิดข้อผิดพลาดที่ไม่คาดคิด ให้แสดงหน้านี้พร้อมปุ่มลองใหม่ แทนหน้าว่าง */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin-ui]", error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="card max-w-md space-y-3 p-6 text-center">
        <h1 className="text-lg font-bold">ໜ້າຈໍມີບັນຫາຊົ່ວຄາວ / Something went wrong</h1>
        <p className="text-sm text-stone-600">
          ກົດລອງໃໝ່ ຫຼື ໂຫຼດໜ້າຈໍອີກຄັ້ງ — ຂໍ້ມູນໃນ Chatwoot ບໍ່ໄດ້ເສຍຫາຍ
          <br />
          Please retry or reload the page — your Chatwoot data is safe.
        </p>
        <div className="flex justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={reset}
            className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            ລອງໃໝ່ / Retry
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-10 rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            ໂຫຼດໃໝ່ / Reload
          </button>
        </div>
      </div>
    </div>
  );
}
