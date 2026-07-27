import { PrimitiveAtom, useAtom } from "jotai";
import { ChangeEvent, KeyboardEvent, useMemo, useState } from "react";

import { Box, Input, InputFeedback, Popper } from "@axelor/ui";
import { GridColumn } from "@axelor/ui/grid";

import { Select } from "@/components/select";
import { i18n } from "@/services/client/i18n";
import { Field } from "@/services/client/meta.types";
import { focusAtom } from "@/utils/atoms";

import { SearchState } from "./types";
import { getFilterCriteria } from "./utils";

import styles from "./search-column.module.scss";

const DATE_TYPES = ["date", "time", "datetime"];
const NUMBER_TYPES = ["decimal", "number", "long", "integer"];

// GridColumn#type is a UI category ("field" | "button"), not the data
// type, so the actual DB type must be read from #serverType instead.
function getSearchField(field: Field): Field {
  return { ...field, type: field.serverType ?? field.type } as Field;
}

function getInvalidMessage(field: Field) {
  const type = (field.serverType || field.type || "").toLowerCase();
  if (DATE_TYPES.includes(type)) return i18n.get("Invalid date");
  if (NUMBER_TYPES.includes(type)) return i18n.get("Invalid number");
  return i18n.get("Invalid value");
}

export interface SearchColumnProps {
  column: GridColumn;
  dataAtom: PrimitiveAtom<SearchState>;
  onSearch?: () => void;
}

function SearchInput({ column, dataAtom, onSearch }: SearchColumnProps) {
  const field = column as Field;
  const [value, setValue] = useAtom(
    useMemo(
      () =>
        focusAtom(
          dataAtom,
          (state) => state[column.name] ?? "",
          (state, value) => ({ ...state, [column.name]: value }),
        ),
      [column.name, dataAtom],
    ),
  );
  const [invalid, setInvalid] = useState(false);
  const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);

  function applySearch() {
    onSearch?.();
  }

  function validate(v: string) {
    setInvalid(
      Boolean(v?.trim()) &&
        getFilterCriteria(getSearchField(field), v) === null,
    );
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (invalid) setInvalid(false);
  }

  function handleBlur() {
    validate(value);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      validate(value);
      applySearch();
    }
  }

  if (field.selectionList) {
    const selected = field.selectionList.find((opt) => opt.value === value);
    return (
      <Box w={100} className={styles.select} d="flex">
        <Select
          multiple={false}
          value={selected ?? null}
          placeholder={i18n.get("Search...")}
          onChange={(value) => {
            setValue(value?.value ?? "");
            applySearch();
          }}
          options={field.selectionList}
          optionKey={(x) => x.value!}
          optionLabel={(x) => x.title!}
          optionEqual={(x, y) => x.value === y.value}
        />
      </Box>
    );
  }

  return (
    <Box className={styles.container} d="flex">
      <Input
        ref={setInputEl}
        type="text"
        value={value || ""}
        invalid={invalid}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={i18n.get("Search...")}
        onKeyDown={handleKeyDown}
      />
      <Popper
        open={invalid}
        target={inputEl}
        placement="bottom-start"
        offset={[0, 4]}
      >
        <InputFeedback invalid className={styles.feedback}>
          {getInvalidMessage(field)}
        </InputFeedback>
      </Popper>
    </Box>
  );
}

export function SearchColumn(props: SearchColumnProps) {
  const { column } = props;
  if (column.searchable === false) {
    return <Box h={100} w={100} />;
  }

  return <SearchInput {...props} />;
}
