"use client";

import { Modal } from "@/components/ui/modal";
import { DisclaimerForm } from "./DisclaimerForm";

interface DisclaimerModalProps {
  isOpen: boolean;
}

/**
 * مودال الإقرار الشفاف — يُعرض بعد المصادقة عند غياب الموافقة
 */
export function DisclaimerModal({ isOpen }: DisclaimerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        /* الإغلاق ممنوع دون موافقة */
      }}
      title="إقرار وإخلاء مسؤولية"
      preventClose
    >
      <DisclaimerForm />
    </Modal>
  );
}
