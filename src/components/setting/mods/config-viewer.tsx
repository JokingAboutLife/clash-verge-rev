import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
} from "@mui/material";
import { atomThemeMode } from "@/services/states";
import { getRuntimeYaml } from "@/services/cmds";
import { DialogRef } from "@/components/base";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useWindowSize } from "@/hooks/use-window-size";

import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js";

export const ConfigViewer = forwardRef<DialogRef>((props, ref) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const editorRef = useRef<any>();
  const instanceRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const themeMode = useRecoilValue(atomThemeMode);
  const { size } = useWindowSize();

  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpen(true);

      getRuntimeYaml().then((data) => {
        const dom = editorRef.current;

        if (!dom) return;
        if (instanceRef.current) instanceRef.current.dispose();

        instanceRef.current = editor.create(editorRef.current, {
          value: data ?? "# Error\n",
          language: "yaml",
          tabSize: 2,
          theme: themeMode === "light" ? "vs" : "vs-dark",
          contextmenu: false,
          mouseWheelZoom: true,
          readOnly: true,
          readOnlyMessage: { value: t("ReadOnlyMessage") },
          automaticLayout: true,
        });
      });
    },
    close: () => setOpen(false),
  }));

  instanceRef.current?.updateOptions({
    minimap: { enabled: size.width >= 1000 },
  });

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xl" fullWidth>
      <DialogTitle>
        {t("Runtime Config")} <Chip label={t("ReadOnly")} size="small" />
      </DialogTitle>

      <DialogContent
        sx={{
          width: "94%",
          height: `${size.height - 200}px`,
          pb: 1,
          userSelect: "text",
        }}>
        <div style={{ width: "100%", height: "100%" }} ref={editorRef} />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)} variant="outlined">
          {t("Back")}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
