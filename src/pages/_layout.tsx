import AppNameSvg from "@/assets/image/clash_verge.svg?react";
import LogoSvg from "@/assets/image/logo.svg?react";
import { Notice } from "@/components/base";
import { LayoutControl } from "@/components/layout/layout-control";
import { LayoutItem } from "@/components/layout/layout-item";
import { LayoutTraffic } from "@/components/layout/layout-traffic";
import { UpdateButton } from "@/components/layout/update-button";
import { useCustomTheme } from "@/components/layout/use-custom-theme";
import { useVerge } from "@/hooks/use-verge";
import { getAxios } from "@/services/api";
import { getPortableFlag } from "@/services/cmds";
import getSystem from "@/utils/get-system";
import { DarkMode, LightMode } from "@mui/icons-material";
import { List, Paper, ThemeProvider } from "@mui/material";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useRoutes } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { SWRConfig, mutate } from "swr";
import { routers } from "./_routers";

export let portableFlag = false;
dayjs.extend(relativeTime);
const OS = getSystem();
let keepUIActive = false;

const Layout = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { t } = useTranslation();
  const { theme } = useCustomTheme();

  const { verge, patchVerge } = useVerge();
  const { language, start_page, enable_system_title, enable_keep_ui_active } =
    verge || {};
  const isDark = theme.palette.mode === "dark";
  keepUIActive = enable_keep_ui_active ?? false;
  const navigate = useNavigate();
  const routersEles = useRoutes(routers)!;

  appWindow.isMaximized().then((maximized) => {
    setIsMaximized(maximized);
  });
  const unlistenResize = appWindow.onResized(() => {
    appWindow.isMaximized().then((value) => {
      if (isMaximized !== value) {
        setIsMaximized(value);
      }
    });
  });

  const handleClose = (keepUIActive: boolean) => {
    if (keepUIActive) {
      appWindow.hide();
    } else {
      appWindow.close();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && OS !== "macos") {
        handleClose(keepUIActive);
      }
    });

    listen("verge://refresh-clash-config", async () => {
      // the clash info may be updated
      await getAxios(true);
      mutate("getProxies");
      mutate("getVersion");
      mutate("getClashConfig");
      mutate("getClashInfo");
      mutate("getRuntimeConfig");
      mutate("getProxyProviders");
    });

    // update the verge config
    listen("verge://refresh-verge-config", () => {
      mutate("getVergeConfig");
    });

    // 设置提示监听
    listen("verge://notice-message", ({ payload }) => {
      const [status, msg] = payload as [string, string];
      switch (status) {
        case "set_config::ok":
          Notice.success(t("Clash Config Updated"));
          break;
        case "set_config::error":
          Notice.error(t(msg));
          break;
        default:
          break;
      }
    });

    setTimeout(async () => {
      portableFlag = await getPortableFlag();
      await appWindow.unminimize();
      await appWindow.show();
      await appWindow.setFocus();
    }, 50);

    return () => {
      unlistenResize.then();
    };
  }, []);

  useEffect(() => {
    if (language) {
      dayjs.locale(language === "zh" ? "zh-cn" : language);
      i18next.changeLanguage(language);
    }
    if (start_page) {
      navigate(start_page);
    }
  }, [language, start_page]);

  return (
    <SWRConfig value={{ errorRetryCount: 3 }}>
      <ThemeProvider theme={theme}>
        <Paper
          square
          elevation={0}
          className={`${OS} layout`}
          onContextMenu={(e) => {
            // only prevent it on Windows
            const validList = ["input", "textarea"];
            const target = e.currentTarget;
            if (
              OS === "windows" &&
              !(
                validList.includes(target.tagName.toLowerCase()) ||
                target.isContentEditable
              )
            ) {
              e.preventDefault();
            }
          }}
          sx={[
            ({ palette }) => ({
              bgcolor: palette.background.paper,
            }),
            OS === "linux" && !enable_system_title
              ? {
                  borderRadius: `${isMaximized ? 0 : "8px"}`,
                  border: "2px solid var(--divider-color)",
                  width: "calc(100vw - 4px)",
                  height: "calc(100vh - 4px)",
                }
              : {},
          ]}>
          <div
            className={`layout__left ${
              enable_system_title ? "system-title" : ""
            }`}>
            <div className="the-logo" data-tauri-drag-region="true">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  overflow: "hidden",
                }}>
                <LogoSvg style={{ width: "50px", marginRight: "10px" }} />
                <AppNameSvg />
              </div>
              <UpdateButton className="the-newbtn" />
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={isDark ? "dark-on" : "dark-off"}
                  timeout={500}
                  classNames="fade-theme">
                  <button
                    className="switch-theme-btn"
                    onClick={() =>
                      patchVerge({ theme_mode: isDark ? "light" : "dark" })
                    }>
                    {isDark ? (
                      <DarkMode fontSize="inherit" />
                    ) : (
                      <LightMode fontSize="inherit" />
                    )}
                  </button>
                </CSSTransition>
              </SwitchTransition>
            </div>

            <List className="the-menu">
              {routers.map((router) => (
                <LayoutItem
                  key={router.label}
                  to={router.path}
                  icon={router.icon}>
                  {t(router.label)}
                </LayoutItem>
              ))}
            </List>

            <div className="the-traffic">
              <LayoutTraffic />
            </div>
          </div>

          <div
            className={`layout__right ${
              enable_system_title ? "system-title" : ""
            }`}>
            {!enable_system_title && (
              <div className="the-bar">
                <div
                  className="the-dragbar"
                  data-tauri-drag-region="true"
                  style={{ width: "100%" }}></div>
                {OS !== "macos" && (
                  <LayoutControl
                    maximized={isMaximized}
                    onClose={() => handleClose(keepUIActive)}
                  />
                )}
              </div>
            )}

            <div className="the-content">{routersEles}</div>
            {/* when proxies page expanded item too musch, this transition will slowly */}
            {/* <TransitionGroup className="the-content">
              <CSSTransition
                key={location.pathname}
                timeout={300}
                classNames="page">
                {routersEles}
              </CSSTransition>
            </TransitionGroup> */}
          </div>
        </Paper>
      </ThemeProvider>
    </SWRConfig>
  );
};

export default Layout;
