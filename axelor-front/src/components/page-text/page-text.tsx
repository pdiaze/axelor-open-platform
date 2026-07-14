import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Button, Input } from "@axelor/ui";

import { alerts } from "@/components/alerts";
import { useDataStore } from "@/hooks/use-data-store";
import { DataStore } from "@/services/client/data-store";
import { SearchResult } from "@/services/client/data";
import { i18n } from "@/services/client/i18n";
import {
  getDefaultMaxPerPage,
  getDefaultPageSize,
} from "@/utils/app-settings.ts";

import { resolvePageSize } from "./utils";
import styles from "./page-text.module.scss";

export function PageText({
  dataStore,
  onResult,
}: {
  dataStore: DataStore;
  onResult?: (result: SearchResult) => void;
}) {
  const page = useDataStore(dataStore, (state) => state.page);
  const defaultPageSize = getDefaultPageSize();
  const maxPageSize = getDefaultMaxPerPage();
  const { offset = 0, totalCount = 0 } = page;
  const [showEditor, setShowEditor] = useState(false);
  const limit = page.limit ?? defaultPageSize;
  const [userPageSize, setUserPageSize] = useState(limit);

  const onChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => setUserPageSize(+e.target.value),
    [],
  );
  const currentPage = useMemo(
    () => Math.floor(offset / limit) + 1,
    [offset, limit],
  );

  const onApply = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const size = resolvePageSize(userPageSize, maxPageSize, limit);
      if (maxPageSize >= 1 && userPageSize > maxPageSize) {
        alerts.warn({
          message: i18n.get("Page size limited to {0} records", size),
        });
      }
      setUserPageSize(size);
      dataStore
        .search({
          limit: size,
          ...(currentPage && {
            offset: (currentPage - 1) * size,
          }),
        })
        .then(onResult);
      setShowEditor(false);
    },
    [userPageSize, maxPageSize, limit, dataStore, currentPage, onResult],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLFormElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setUserPageSize(limit);
        setShowEditor(false);
      }
    },
    [limit],
  );

  const onShow = useCallback(() => setShowEditor(true), []);

  const to = limit > 0 ? Math.min(offset + limit, totalCount) : totalCount;
  const start = to === 0 ? 0 : offset + 1;
  const text = i18n.get("{0} to {1} of {2}", start, to, totalCount);

  if (showEditor) {
    return (
      <form
        className={styles.editor}
        onSubmit={onApply}
        onKeyDown={handleKeyDown}
        noValidate
        data-testid={"page-limit-form"}
      >
        <Input
          name="limit"
          type="number"
          min={1}
          value={userPageSize}
          onChange={onChange}
          onFocus={(e) => e.target.select()}
          autoFocus
          style={{ width: "5rem" }}
          data-testid={"page-limit"}
        />
        <Button variant="secondary" type="submit" data-testid={"btn-apply"}>
          {i18n.get("Apply")}
        </Button>
      </form>
    );
  }
  return (
    <div className={styles.text} onClick={onShow}>
      {text}
    </div>
  );
}
