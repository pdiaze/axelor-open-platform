import { useAtomValue } from "jotai";
import {
  ChangeEvent,
  ClipboardEvent,
  FocusEvent,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CountryData,
  CountrySelectorDropdown,
  FlagImage,
  getActiveFormattingMask,
  ParsedCountry,
  usePhoneInput,
} from "react-international-phone";

import { AdornedInput, Box, Button, Portal, clsx } from "@axelor/ui";

import { Icon } from "@/components/icon";
import { TextLink } from "@/components/text-link";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { i18n } from "@/services/client/i18n";
import { useViewRoute } from "@/view-containers/views/scope";
import { FieldControl, FieldProps } from "../../builder";
import { useInput } from "../../builder/hooks";
import {
  DEFAULT_COUNTRIES,
  FLAGS,
  getPhoneInfo,
  normalizePastedPhoneValue,
  useDefaultCountry,
} from "./utils";

import "react-international-phone/style.css";

import flags from "@/assets/flags.svg";
import styles from "./phone.module.scss";

const digitsOnly = (value: string) => value.replace(/\D/g, "");
const trimTrunkPrefix = (value: string) => value.replace(/^0+/, "");
const stripDialCode = (value: string, dialCode: string) =>
  value.startsWith(dialCode) ? value.slice(dialCode.length) : value;

export function Phone({
  inputProps,
  ...props
}: FieldProps<string> & {
  inputProps?: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "autoComplete" | "placeholder" | "onFocus"
  >;
}) {
  const { schema, readonly, widgetAtom, valueAtom, invalid } = props;
  const { uid, placeholder: _placeholder, widgetAttrs } = schema;
  const {
    placeholderNumberType,
    initialCountry,
    preferredCountries: _preferredCountries,
    onlyCountries: _onlyCountries,
  }: {
    placeholderNumberType?: "FIXED_LINE" | "MOBILE";
    initialCountry?: string;
    preferredCountries?: string;
    onlyCountries?: string;
  } = widgetAttrs;

  const { attrs } = useAtomValue(widgetAtom);
  const { focus, required } = attrs;

  const onlyCountries = useMemo(
    () =>
      _onlyCountries?.split(/\W+/).map((country) => country.toLowerCase()) ??
      [],
    [_onlyCountries],
  );

  const defaultCountry = useDefaultCountry(initialCountry, onlyCountries);

  const preferredCountries = useMemo(() => {
    if (_preferredCountries) {
      return _preferredCountries
        .split(/\W+/)
        .map((country) => country.toLowerCase());
    }

    return [
      ...new Set([
        defaultCountry,
        ...navigator.languages
          .map((language) => language.split("-")[1]?.toLowerCase())
          .filter(
            (country) =>
              country &&
              (!onlyCountries.length || onlyCountries.includes(country)),
          ),
      ]),
    ];
  }, [_preferredCountries, defaultCountry, onlyCountries]);

  const value = useAtomValue(valueAtom);
  const noPrefix = !!value && !value.startsWith("+");

  const {
    text: _text,
    onChange,
    onBlur: _onBlur,
    onKeyDown,
    setValue,
  } = useInput(valueAtom, {
    schema,
  });

  const text = useMemo(() => {
    return noPrefix ? _text.replace(/^0/, "") : _text;
  }, [_text, noPrefix]);

  const getEffectiveValue = useCallback(
    (phone: string, country: ParsedCountry, inputValue: string = phone) => {
      const newValue = phone !== `+${country.dialCode}` ? phone : "";
      const storedValue = String(value ?? "");

      if (noPrefix) {
        const nationalDigits = stripDialCode(
          digitsOnly(newValue),
          country.dialCode,
        );
        const unchanged =
          trimTrunkPrefix(nationalDigits) ===
          trimTrunkPrefix(digitsOnly(storedValue));

        return unchanged ? storedValue : inputValue;
      }

      return digitsOnly(newValue) === digitsOnly(storedValue)
        ? storedValue
        : newValue;
    },
    [noPrefix, value],
  );

  const countries = useMemo(() => {
    // Filter out countries that are not in `onlyCountries`, if specified.
    let countries = onlyCountries.length
      ? DEFAULT_COUNTRIES.filter((country) =>
          onlyCountries.includes(country[1]),
        )
      : DEFAULT_COUNTRIES;

    // Translate country names
    countries = countries.map((country) => {
      const [name, ...rest] = country;
      return [i18n.get(name), ...rest] as CountryData;
    });
    countries.sort((a, b) => a[0].localeCompare(b[0]));

    return countries;
  }, [onlyCountries]);

  const handlePhoneChange = useCallback(
    ({
      phone,
      country,
      inputValue,
    }: {
      phone: string;
      country: ParsedCountry;
      inputValue: string;
    }) => {
      // Keep stored values stable when the library only changes formatting.
      onChange({
        target: { value: getEffectiveValue(phone, country, inputValue) },
      } as ChangeEvent<HTMLInputElement>);
    },
    [getEffectiveValue, onChange],
  );

  const {
    inputValue,
    phone,
    country,
    setCountry,
    handlePhoneValueChange,
    inputRef,
  } = usePhoneInput({
    defaultCountry,
    countries: countries,
    value: text,
    onChange: handlePhoneChange,
    disableDialCodeAndPrefix: noPrefix,
  });
  const pendingInternationalPhoneRef = useRef<string | null>(null);

  const applyPhoneInputValue = useCallback(
    (value: string, data: string = value, selectionStart = value.length) => {
      handlePhoneValueChange({
        preventDefault() {},
        nativeEvent: { inputType: "insertFromPaste", data },
        target: { value, selectionStart },
      } as unknown as ChangeEvent<HTMLInputElement>);
    },
    [handlePhoneValueChange],
  );

  useEffect(() => {
    if (noPrefix || !pendingInternationalPhoneRef.current) return;

    const pendingPhone = pendingInternationalPhoneRef.current;
    pendingInternationalPhoneRef.current = null;
    applyPhoneInputValue(pendingPhone);
  }, [applyPhoneInputValue, noPrefix]);

  // If case of only dial code, set empty value instead.
  const onBlur = useCallback(() => {
    _onBlur({
      target: { value: getEffectiveValue(phone, country, inputValue) },
    } as FocusEvent<HTMLInputElement>);
  }, [_onBlur, country, getEffectiveValue, inputValue, phone]);

  const { id: routeId } = useViewRoute();
  const routeIdRef = useRef(routeId);

  useEffect(() => {
    if (routeId === routeIdRef.current || text) return;
    routeIdRef.current = routeId;
    if (country.iso2 !== defaultCountry) {
      setCountry(defaultCountry);
    }
  }, [routeId, text, country.iso2, defaultCountry, setCountry]);

  const placeholder = useMemo(() => {
    if (_placeholder) return _placeholder;

    const { dialCode } = country;

    // For placeholder, we just need the default mask for specified country.
    let phoneFormat = getActiveFormattingMask({ phone: "", country });

    // Special case for French mobile phone numbers
    if (
      dialCode === "33" &&
      placeholderNumberType?.toUpperCase() === "MOBILE"
    ) {
      phoneFormat = phoneFormat.replace(".", "6");
    }

    let currentNumber = 0;
    const numbers = phoneFormat.replace(/\./g, () => `${++currentNumber % 10}`);
    const placeholder = noPrefix ? numbers : `+${dialCode} ${numbers}`;

    return placeholder;
  }, [_placeholder, country, noPrefix, placeholderNumberType]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const toggleTimeRef = useRef<number>(0);

  const toggleDropdown = useCallback(() => {
    toggleTimeRef.current = new Date().getTime();
    setShowDropdown(!showDropdown);
  }, [showDropdown]);

  // Position for portaled dropdown
  const dropdownPos = useMemo(() => {
    if (!showDropdown) return {};
    const { bottom, left } = buttonRef.current?.getBoundingClientRect() ?? {};
    return { top: bottom, left };
  }, [showDropdown]);

  // Close dropdown on scroll.
  useEffect(() => {
    if (!showDropdown) return;

    const handleScroll = (event: Event) => {
      if (!dropdownRef.current?.contains(event.target as Element)) {
        setShowDropdown(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [showDropdown]);

  const countryIso2 = useMemo(() => {
    const { iso2 } = country;
    return onlyCountries.length && !onlyCountries.includes(iso2)
      ? defaultCountry
      : iso2;
  }, [country, defaultCountry, onlyCountries]);

  const hasValue = !!text && text === phone;
  const showButton = hasValue || !readonly;

  const [{ isPossible: isPossibleNumber, numberType }, setPhoneInfo] = useState<{
    isPossible: boolean;
    numberType: string | undefined;
  }>({ isPossible: false, numberType: undefined });


  useAsyncEffect(async () => {
    const phoneNumber = await getPhoneInfo(phone);
    setPhoneInfo({
      isPossible: phoneNumber.isPossible(),
      numberType: phoneNumber.getDisplayType(),
    });
  }, [phone]);

  const handleOpenPhoneLink = useCallback(() => {
    window.open(
      `tel:${noPrefix ? value : phone}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [noPrefix, value, phone]);

  const applyDefaultPaste = useCallback(
    (pastedText: string) => {
      const input = inputRef.current;
      const selectionStart = input?.selectionStart ?? inputValue.length;
      const selectionEnd = input?.selectionEnd ?? selectionStart;
      const value = `${inputValue.slice(0, selectionStart)}${pastedText}${inputValue.slice(selectionEnd)}`;

      applyPhoneInputValue(
        value,
        pastedText,
        selectionStart + pastedText.length,
      );
    },
    [applyPhoneInputValue, inputRef, inputValue],
  );

  const handlePaste = useCallback(
    async (event: ClipboardEvent<HTMLInputElement>) => {
      const pastedText = event.clipboardData.getData("text");

      if (noPrefix && !pastedText.trimStart().startsWith("+")) return;

      event.preventDefault();

      const normalized = await normalizePastedPhoneValue(
        pastedText,
        countryIso2,
      );

      if (!normalized) {
        applyDefaultPaste(pastedText);
        return;
      }

      const normalizedCountry = normalized.countryIso2;

      if (
        normalizedCountry &&
        onlyCountries.length &&
        !onlyCountries.includes(normalizedCountry)
      ) {
        applyDefaultPaste(pastedText);
        return;
      }

      // When pasting an international number (+XX...) into a no-prefix field,
      // bypass handlePhoneValueChange because disableDialCodeAndPrefix strips
      // the + prefix. useInput's onChange only commits on blur, so write to
      // the value atom directly to immediately leave no-prefix mode.
      if (noPrefix) {
        pendingInternationalPhoneRef.current = normalized.phone;
        setValue(normalized.phone, true);
        return;
      }

      applyPhoneInputValue(normalized.phone);
    },
    [
      applyPhoneInputValue,
      applyDefaultPaste,
      countryIso2,
      noPrefix,
      setValue,
      onlyCountries,
    ],
  );

  const handleCountrySelect = useCallback(
    (country: ParsedCountry) => {
      // In no-prefix mode, the dropdown may highlight the
      // current/default country even though the value is still
      // country-unspecified (XX), so selecting it must still
      // apply the country without dropping the national digits.
      if (noPrefix) {
        const digits = inputValue.replace(/\D/g, "");
        const nationalDigits = digits.startsWith(country.dialCode)
          ? digits.slice(country.dialCode.length)
          : digits;
        const nextPhone = `+${country.dialCode}${nationalDigits}`;

        pendingInternationalPhoneRef.current = nextPhone;
        setValue(nextPhone, true);
      } else if (country.iso2 !== countryIso2) {
        setValue(null);
        setCountry(country.iso2);
      }
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [countryIso2, inputRef, inputValue, noPrefix, setCountry, setValue],
  );

  const handleDropdownClose = useCallback(() => {
    if (new Date().getTime() - toggleTimeRef.current > 200) {
      setTimeout(() => setShowDropdown(false), 100);
    }
  }, []);

  return (
    <FieldControl {...props} className={styles.container}>
      <Box className={clsx(styles.phone, { [styles.readonly]: readonly })}>
        {showButton && (
          <>
            <Box title={i18n.get(country.name)}>
              <Button
                ref={buttonRef}
                className={styles.country}
                onMouseDown={(event) => {
                  event.preventDefault();
                  if (event.button === 0) {
                    toggleDropdown();
                  }
                }}
                disabled={readonly}
              >
                {noPrefix ? (
                  <XxFlag className={styles.xxFlag} />
                ) : (
                  <FlagImage
                    iso2={countryIso2}
                    src={flags}
                    className={styles.flag}
                  />
                )}
                {!readonly && (
                  <Icon
                    icon={`arrow_drop_${showDropdown ? "up" : "down"}`}
                    className={styles.arrow}
                  />
                )}
              </Button>
            </Box>
            {!readonly && (
              <Portal>
                <Box
                  ref={dropdownRef}
                  className={styles.dropdown}
                  style={dropdownPos}
                >
                  <CountrySelectorDropdown
                    show={showDropdown}
                    selectedCountry={countryIso2}
                    onSelect={handleCountrySelect}
                    onClose={handleDropdownClose}
                    preferredCountries={preferredCountries}
                    countries={countries}
                    flags={FLAGS}
                    listItemFlagClassName={styles.flag}
                  />
                </Box>
              </Portal>
            )}
          </>
        )}
        {readonly ? (
          <TextLink
            href={`tel:${noPrefix ? value : phone}`}
            className={styles.link}
            title={numberType}
          >
            {hasValue && inputValue}
          </TextLink>
        ) : (
          <Box className={styles.inputWrapper}>
            <AdornedInput
              key={focus ? "focused" : "normal"}
              ref={inputRef}
              data-input
              type="tel"
              id={uid}
              autoFocus={focus}
              placeholder={placeholder}
              value={inputValue}
              invalid={invalid}
              required={required}
              onKeyDown={onKeyDown}
              onChange={handlePhoneValueChange}
              onPaste={handlePaste}
              onBlur={onBlur}
              title={numberType}
              className={clsx(styles.input, {
                [styles.warning]: !invalid && hasValue && !isPossibleNumber,
              })}
              endAdornment={
                <Button
                  onClick={handleOpenPhoneLink}
                  disabled={!isPossibleNumber}
                  title={i18n.get("Call")}
                >
                  <Icon icon="telephone" />
                </Button>
              }
              {...inputProps}
            />
          </Box>
        )}
      </Box>
    </FieldControl>
  );
}

function XxFlag({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="xx-flag-clip">
          <rect x=".5" y="4" width="23" height="16" rx="1.75" />
        </clipPath>
      </defs>
      <rect
        x=".5"
        y="4"
        width="23"
        height="16"
        rx="1.75"
        fill="var(--bs-secondary-bg)"
        stroke="var(--bs-secondary-color)"
        strokeWidth="1"
      />
      <line
        x1=".5"
        y1="4"
        x2="23.5"
        y2="20"
        stroke="var(--bs-secondary-color)"
        strokeWidth="1"
        clipPath="url(#xx-flag-clip)"
      />
      <line
        x1="23.5"
        y1="4"
        x2=".5"
        y2="20"
        stroke="var(--bs-secondary-color)"
        strokeWidth="1"
        clipPath="url(#xx-flag-clip)"
      />
    </svg>
  );
}
