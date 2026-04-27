"use client";
import { ITooltipParams } from "ag-grid-community";

export const EllipsisTooltipComponent = (props: ITooltipParams) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        padding: "6px 10px",
        fontSize: "13px",
        color: "#053A88",
        fontWeight: "500",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        whiteSpace: "nowrap",
        maxWidth: "300px",
        wordBreak: "break-all",
      }}
    >
      {props.value}
    </div>
  );
};
