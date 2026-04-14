"use client";

import { useRef } from "react";
import ConversationSelectedDay from "@/app/components/conversationSelectedDay"
import { X} from 'lucide-react';


interface ConversationModalProps {
  setIsShow: (isShow:boolean) => void;
  organization:string;
  event:string;
  year:number;
  month:number;
  day:number;
}

export default function ConversationModal({ setIsShow, organization, event, year, month, day }:ConversationModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsShow(false);
  };


  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
      onClick={handleClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-sm font-semibold">会話履歴</h2>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X />
          </button>
        </div>

        <div ref={contentRef} className="w-full px-5 py-4 overflow-y-auto flex-1">
          <ConversationSelectedDay organization={organization} event={event} year={year} month={month} day={day} />
        </div>

        <div className="px-5 py-3 border-t text-right">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >
            閉じる
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}