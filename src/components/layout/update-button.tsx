import useSWR from "swr";
import { useRef } from "react";
import { Button } from "@mui/material";
import { checkUpdate } from "@tauri-apps/api/updater";
import { UpdateViewer } from "../setting/mods/update-viewer";
import { DialogRef } from "../base";
import { useVerge } from "@/hooks/use-verge";

interface Props {
  className?: string;
}

export const UpdateButton = (props: Props) => {
  const { className } = props;
  const { verge } = useVerge();
  const { auto_check_update } = verge || {};

  const viewerRef = useRef<DialogRef>(null);

  const { data: updateInfo } = useSWR(
    auto_check_update || auto_check_update === null ? "checkUpdate" : null,
    checkUpdate,
    {
      errorRetryCount: 2,
      revalidateIfStale: false,
      focusThrottleInterval: 36e5, // 1 hour
    },
  );

  if (!updateInfo?.shouldUpdate) return null;

  return (
    <>
      <UpdateViewer ref={viewerRef} />

      <button
        style={{
          backgroundColor: "#FF4040",
          border: "none",
          color: "white",
          padding: "2px 10px",
          fontSize: "14px",
          fontWeight: 600,
          borderRadius: "4px",
        }}
        className={className}
        onClick={() => viewerRef.current?.open()}>
        New
      </button>
    </>
  );
};
