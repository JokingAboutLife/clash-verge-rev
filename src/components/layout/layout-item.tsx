import {
  alpha,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { useMatch, useResolvedPath, useNavigate } from "react-router-dom";
import { useVerge } from "@/hooks/use-verge";
interface Props {
  to: string;
  children: string;
  icon: React.ReactNode[];
}
export const LayoutItem = (props: Props) => {
  const { to, children, icon } = props;
  const { verge } = useVerge();
  const { menu_icon } = verge ?? {};
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  const navigate = useNavigate();

  return (
    <ListItem sx={{ py: 0.5, maxWidth: 250, mx: "auto", padding: "4px 0px" }}>
      <ListItemButton
        selected={!!match}
        sx={[
          {
            borderRadius: 2,
            marginLeft: 1.25,
            paddingLeft: 1,
            paddingRight: 1,
            marginRight: 1.25,
            "& .MuiListItemText-primary": {
              color: "text.primary",
              fontWeight: "700",
            },
          },
          ({ palette: { mode, primary } }) => {
            const bgcolor =
              mode === "light"
                ? alpha(primary.main, 0.15)
                : alpha(primary.main, 0.35);
            const color = mode === "light" ? "#1f1f1f" : "#ffffff";

            return {
              "&.MuiListItemButton-root .MuiListItemText-primary": {
                color: alpha(color, 0.6),
              },
              "&.MuiListItemButton-root .MuiListItemIcon-root": {
                color: alpha(color, 0.6),
              },
              // 涟漪效果颜色
              "& .MuiTouchRipple-root .MuiTouchRipple-rippleVisible": {
                color: primary.main,
              },
              "&.Mui-selected": { bgcolor },
              "&.Mui-focusVisible": { bgcolor },
              "&.Mui-selected:hover": { bgcolor },
              "&.Mui-selected .MuiListItemText-primary": { color },
              "&.Mui-selected .MuiListItemIcon-root": { color },
            };
          },
        ]}
        onClick={() => navigate(to)}>
        {(menu_icon === "monochrome" || !menu_icon) && (
          <ListItemIcon sx={{ marginLeft: "6px" }}>{icon[0]}</ListItemIcon>
        )}
        {menu_icon === "colorful" && <ListItemIcon>{icon[1]}</ListItemIcon>}
        <ListItemText
          sx={{
            textAlign: "center",
            marginLeft: menu_icon === "disable" ? "" : "-35px",
          }}
          primary={children}
        />
      </ListItemButton>
    </ListItem>
  );
};
