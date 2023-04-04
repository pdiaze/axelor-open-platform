import { Field } from "@/services/client/meta.types";
import { legacyClassNames } from "@/styles/legacy";
import { Box } from "@axelor/ui";
import { GridColumnProps } from "@axelor/ui/grid/grid-column";
import { useWidgetComp } from "../../hooks";
import { useHilites } from "@/hooks/use-parser";

function CellRenderer(props: GridColumnProps) {
  const { type, widget } = props.data as Field;
  const { state, data: Comp } = useWidgetComp((widget || type)!);
  if (state === "loading") return null;
  return (Comp ? <Comp {...props} /> : props.children) as React.ReactElement;
}

export function Cell(props: GridColumnProps) {
  const { data, record } = props;
  const { type, widget, hilites } = data as Field;
  const { children, style, className, onClick } =
    props as React.HTMLAttributes<HTMLDivElement>;
  const $className = useHilites(hilites ?? [])(record)?.[0]?.css;

  function render() {
    if (widget || type !== "field") {
      return <CellRenderer {...props} />;
    }
    return children;
  }

  return (
    <Box
      {...{
        style,
        className: legacyClassNames(className, $className),
        onClick,
      }}
    >
      {render()}
    </Box>
  );
}
